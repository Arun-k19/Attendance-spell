import React, { useState, useEffect, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

// ─── HOLIDAYS ───────────────────────────────────────────────────────
const HOLIDAYS = [
  { date: "2025-01-14", name: "Pongal" },
  { date: "2025-01-26", name: "Republic Day" },
  { date: "2025-04-10", name: "Good Friday" },
  { date: "2025-04-14", name: "Tamil New Year" },
  { date: "2025-04-18", name: "Mahavir Jayanti" },
  { date: "2025-05-01", name: "Labour Day" },
  { date: "2025-08-15", name: "Independence Day" },
  { date: "2025-09-05", name: "Onam" },
  { date: "2025-10-02", name: "Gandhi Jayanti" },
  { date: "2025-10-24", name: "Dussehra" },
  { date: "2025-11-05", name: "Diwali" },
  { date: "2025-12-25", name: "Christmas" },
];
const HOLIDAY_MAP = Object.fromEntries(HOLIDAYS.map(h => [h.date, h.name]));
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const DEPT_CONFIG = {
  CSE:   { emoji: "💻", color: "#2563eb" },
  ECE:   { emoji: "📡", color: "#0891b2" },
  EEE:   { emoji: "⚡", color: "#dc2626" },
  IT:    { emoji: "🖥️", color: "#7c3aed" },
  MECH:  { emoji: "⚙️", color: "#b45309" },
  CIVIL: { emoji: "🏗️", color: "#15803d" },
};
const ALL_DEPTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];
const YEAR_LABELS = { "1": "I Year", "2": "II Year", "3": "III Year", "4": "IV Year" };

// ─── ROLE DETECTION ─────────────────────────────────────────────────
/**
 * Returns:
 *   Admin  → { role:"admin",  allowedDepts: ALL, allowedYearsByDept: null }
 *   HOD    → { role:"hod",    allowedDepts: [hodDept], allowedYearsByDept: null }
 *   Staff  → { role:"staff",  allowedDepts: [...], allowedYearsByDept: { CSE:["1","3"] } }
 */
const getRoleInfo = () => {
  const userData  = JSON.parse(localStorage.getItem("user")      || "{}");
  const hodData   = JSON.parse(localStorage.getItem("hodData")   || "{}");
  const staffData = JSON.parse(localStorage.getItem("staffData") || "{}");

  const role = (userData?.role || "").toLowerCase();

  if (role === "admin") {
    return { role: "admin", allowedDepts: ALL_DEPTS, allowedYearsByDept: null };
  }

  if (role === "hod") {
    const dept = hodData?.department || userData?.department || "";
    return {
      role: "hod",
      allowedDepts: dept ? [dept] : ALL_DEPTS,
      allowedYearsByDept: null,
    };
  }

  // Staff / Faculty
  const subjects    = staffData?.subjects || userData?.subjects || [];
  const primaryDept = staffData?.department || userData?.department || "";

  if (!subjects.length) {
    return {
      role: "staff",
      allowedDepts: primaryDept ? [primaryDept] : [],
      allowedYearsByDept: primaryDept ? { [primaryDept]: ["1","2","3","4"] } : {},
    };
  }

  // Build dept → Set<year> from subjects array
  const map = {};
  subjects.forEach(({ year, department }) => {
    if (!year) return;
    const dept = department || primaryDept;
    if (!dept) return;
    if (!map[dept]) map[dept] = new Set();
    map[dept].add(String(year));
  });

  const allowedYearsByDept = {};
  Object.entries(map).forEach(([d, ySet]) => {
    allowedYearsByDept[d] = Array.from(ySet).sort();
  });

  return {
    role: "staff",
    allowedDepts: Object.keys(allowedYearsByDept),
    allowedYearsByDept,
  };
};

// ─── CALENDAR POPOVER ───────────────────────────────────────────────
const CalendarPopover = ({ label, value, onChange, fromDate, toDate }) => {
  const [open, setOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(() => value ? new Date(value).getMonth() : new Date().getMonth());
  const [calYear, setCalYear] = useState(() => value ? new Date(value).getFullYear() : new Date().getFullYear());
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const thisMonthHolidays = HOLIDAYS.filter(h => {
    const hd = new Date(h.date);
    return hd.getMonth() === calMonth && hd.getFullYear() === calYear;
  });

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const handleDayClick = (ds, dow, isHol, isSun) => {
    if (isHol) { alert(`${HOLIDAY_MAP[ds]} — Holiday`); return; }
    if (isSun) { alert("Sunday is a holiday"); return; }
    onChange(ds);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 4, letterSpacing: "0.5px" }}>{label}</div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          height: 38, width: "100%",
          border: open ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
          borderRadius: 8, background: open ? "#eff6ff" : "#f8fafc",
          color: value ? "#1e293b" : "#94a3b8",
          padding: "0 10px", fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          boxShadow: open ? "0 0 0 3px #dbeafe" : "none",
          transition: "all 0.15s", textAlign: "left"
        }}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M5 1v3M11 1v3M1 7h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span style={{ flex: 1 }}>{value || "Select date"}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999,
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          padding: 14, width: 260, animation: "calPop 0.15s ease"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <button onClick={prevMonth} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>‹</button>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#1e3a5f" }}>{MONTH_SHORT[calMonth]} {calYear}</span>
            <button onClick={nextMonth} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 6, width: 26, height: 26, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>›</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, color: "#94a3b8", padding: "2px 0" }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const mm = String(calMonth + 1).padStart(2, "0");
              const dd = String(day).padStart(2, "0");
              const ds = `${calYear}-${mm}-${dd}`;
              const dow = new Date(calYear, calMonth, day).getDay();
              const isHol = !!HOLIDAY_MAP[ds];
              const isSun = dow === 0;
              const isSat = dow === 6;
              const isSelected = ds === value;
              const inRange = fromDate && toDate && ds > fromDate && ds < toDate && !isHol && !isSun && !isSat;

              let bg = "transparent", color = "#334155", fw = 400, cursor = "pointer", title = "";
              if (isHol)       { bg = "#fee2e2"; color = "#dc2626"; fw = 700; cursor = "not-allowed"; title = HOLIDAY_MAP[ds]; }
              else if (isSun)  { color = "#ef4444"; cursor = "not-allowed"; }
              else if (isSat)  { color = "#3b82f6"; }
              if (inRange)     { bg = "#dbeafe"; color = "#1d4ed8"; }
              if (isSelected)  { bg = "#1e3a5f"; color = "#fff"; fw = 700; }
              const isToday = ds === today && !isSelected;

              return (
                <div
                  key={i}
                  title={title}
                  onClick={() => handleDayClick(ds, dow, isHol, isSun)}
                  style={{
                    textAlign: "center", borderRadius: 5, padding: "4px 0",
                    background: bg, color, fontWeight: fw, fontSize: 11,
                    cursor, transition: "background 0.1s",
                    outline: isToday ? "2px solid #94a3b8" : "none",
                    outlineOffset: "-1px",
                  }}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {thisMonthHolidays.length > 0 && (
            <div style={{ marginTop: 10, borderTop: "1px solid #f1f5f9", paddingTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", marginBottom: 5, letterSpacing: "0.5px" }}>HOLIDAYS THIS MONTH</div>
              {thisMonthHolidays.map(h => (
                <div key={h.date} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 500 }}>{h.name}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{h.date.slice(8)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 8, borderTop: "1px solid #f1f5f9", paddingTop: 8, flexWrap: "wrap" }}>
            {[
              { bg: "#fee2e2", border: "#dc2626", label: "Holiday" },
              { bg: "transparent", border: "#ef4444", label: "Sunday" },
              { bg: "#dbeafe", border: "#3b82f6", label: "In range" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: l.bg, border: `1px solid ${l.border}`, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: "#64748b" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── STUDENT MODAL ───────────────────────────────────────────────────
const StudentModal = ({ student, onClose, department, year }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/attendance/student-detail", {
          params: { regNo: student.roll, department, year }
        });
        setDetails(res.data);
      } catch {
        setDetails({
          periods: [
            { subject: "Maths",     present: 18, total: 20 },
            { subject: "Physics",   present: 15, total: 20 },
            { subject: "Chemistry", present: 17, total: 20 },
            { subject: "English",   present: 19, total: 20 },
            { subject: "CS",        present: 16, total: 20 },
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [student.roll]);

  const pct = Number(student.percentage);
  const pctColor = pct >= 75 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";

  const chartData = details?.periods?.map(p => ({
    name: p.subject,
    percentage: p.total ? Math.round((p.present / p.total) * 100) : 0,
    present: p.present,
    total: p.total,
  })) || [];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
        zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, width: "100%", maxWidth: 540,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
          animation: "slideUp 0.25s ease"
        }}
      >
        <div style={{
          background: "linear-gradient(135deg,#1e3a5f,#2563eb)",
          borderRadius: "16px 16px 0 0", padding: "20px 24px", color: "#fff"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2, letterSpacing: 1 }}>STUDENT REPORT</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{student.name}</div>
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{student.roll}</div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8,
                color: "#fff", width: 32, height: 32, cursor: "pointer", fontSize: 16,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >✕</button>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            {[
              { label: "Present", val: student.present, bg: "#16a34a" },
              { label: "Absent",  val: student.absent,  bg: "#dc2626" },
              { label: "Total",   val: student.total,   bg: "#6366f1" },
            ].map(p => (
              <div key={p.label} style={{ background: p.bg, borderRadius: 8, padding: "6px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{p.val}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>{p.label}</div>
              </div>
            ))}
            <div style={{
              background: "rgba(255,255,255,0.15)", borderRadius: 8,
              padding: "6px 14px", textAlign: "center",
              border: `2px solid ${pctColor}`
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{pct}%</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>Overall</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { bg: "#eff6ff", color: "#1d4ed8", text: department },
              { bg: "#f0fdf4", color: "#15803d", text: `Year ${year}` },
              {
                bg: pct >= 75 ? "#f0fdf4" : "#fef2f2",
                color: pctColor,
                text: pct >= 75 ? "✓ Eligible" : "✗ Shortage",
                border: pct >= 75 ? "#86efac" : "#fca5a5"
              },
            ].map((b, i) => (
              <span key={i} style={{
                background: b.bg, color: b.color, borderRadius: 6,
                padding: "4px 12px", fontSize: 12, fontWeight: 600,
                border: b.border ? `1px solid ${b.border}` : "none"
              }}>{b.text}</span>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
              Loading subject details...
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1e3a5f", marginBottom: 12 }}>
                Subject-wise Attendance
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} unit="%" axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val, name, props) =>
                      [`${props.payload.present}/${props.payload.total} (${val}%)`, "Attendance"]
                    }
                    contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.percentage >= 75 ? "#16a34a" : entry.percentage >= 60 ? "#d97706" : "#dc2626"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              <div style={{ textAlign: "right", fontSize: 11, color: "#94a3b8", marginTop: -4, marginBottom: 12 }}>
                — 75% minimum required
              </div>

              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Subject", "Present", "Total", "%"].map(h => (
                      <th key={h} style={{
                        padding: "8px 10px", textAlign: "left",
                        fontWeight: 600, color: "#64748b",
                        borderBottom: "1px solid #e2e8f0", fontSize: 12
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, i) => {
                    const c = row.percentage >= 75 ? "#16a34a" : row.percentage >= 60 ? "#d97706" : "#dc2626";
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px 10px", fontWeight: 500 }}>{row.name}</td>
                        <td style={{ padding: "8px 10px", color: "#16a34a" }}>{row.present}</td>
                        <td style={{ padding: "8px 10px", color: "#64748b" }}>{row.total}</td>
                        <td style={{ padding: "8px 10px" }}>
                          <span style={{
                            background: c + "18", color: c,
                            borderRadius: 4, padding: "2px 8px",
                            fontWeight: 700, fontSize: 12
                          }}>{row.percentage}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN REPORTS PAGE ───────────────────────────────────────────────
const Reports = () => {
  // ── Role info ─────────────────────────────────────────────
  const roleInfo = getRoleInfo();

  // ── State ─────────────────────────────────────────────────
  const [department, setDepartment] = useState(() =>
    roleInfo.allowedDepts.length === 1 ? roleInfo.allowedDepts[0] : ""
  );
  const [year,             setYear]             = useState("");
  const [fromDate,         setFromDate]         = useState("");
  const [toDate,           setToDate]           = useState("");
  const [showReport,       setShowReport]       = useState(false);
  const [report,           setReport]           = useState([]);
  const [workingDays,      setWorkingDays]       = useState(null);
  const [showToast,        setShowToast]        = useState(null);
  const [search,           setSearch]           = useState("");
  const [showDefaulters,   setShowDefaulters]   = useState(false);
  const [selectedStudent,  setSelectedStudent]  = useState(null);
  const [loading,          setLoading]          = useState(false);

  useEffect(() => {
    setToDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Auto-select year if only one allowed for chosen dept
  useEffect(() => {
    if (!department) { setYear(""); return; }
    const years = getAllowedYears(department);
    if (years.length === 1) setYear(years[0]);
    else setYear("");
    setShowReport(false);
    setReport([]);
  }, [department]);

  const getAllowedYears = (dept) => {
    if (!roleInfo.allowedYearsByDept) return ["1","2","3","4"];
    return roleInfo.allowedYearsByDept[dept] || [];
  };

  const showAlert = useCallback((msg, type = "info") => {
    setShowToast({ msg, type });
    setTimeout(() => setShowToast(null), 2800);
  }, []);

  const handleSmartDate = useCallback((type, value) => {
    const dateObj = new Date(value);
    if (dateObj > new Date())     { showAlert("Future date not allowed", "danger"); return; }
    if (dateObj.getDay() === 0)   { showAlert("Sunday is a holiday", "danger"); return; }
    if (HOLIDAY_MAP[value])       { showAlert(`${HOLIDAY_MAP[value]} — Holiday`, "warning"); return; }
    type === "from" ? setFromDate(value) : setToDate(value);
  }, [showAlert]);

  // Working days calculation
  useEffect(() => {
    if (!fromDate || !toDate) return;
    const s = new Date(fromDate), e = new Date(toDate);
    if (s > e) return;
    let count = 0, temp = new Date(s);
    while (temp <= e) {
      const d = temp.getDay(), ds = temp.toISOString().split("T")[0];
      if (d !== 0 && d !== 6 && !HOLIDAY_MAP[ds]) count++;
      temp.setDate(temp.getDate() + 1);
    }
    setWorkingDays(count);
  }, [fromDate, toDate]);

  // Fetch report
  const calculateReport = async () => {
    if (!department || !year || !fromDate || !toDate) {
      showAlert("Fill all fields", "danger"); return;
    }
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3001/api/attendance/report", {
        params: { department, year, from: fromDate, to: toDate }
      });
      const records = res.data;
      if (!records.length) { showAlert("No attendance data found", "danger"); setLoading(false); return; }

      const final = [];
      records.forEach(rec => {
        rec.attendance.forEach(a => {
          const roll = a.studentId?.regNo, name = a.studentId?.name;
          let stu = final.find(s => s.roll === roll);
          if (!stu) { stu = { roll, name, present: 0, total: 0 }; final.push(stu); }
          stu.total++;
          if (a.status === "Present") stu.present++;
        });
      });
      final.forEach(s => {
        s.absent = s.total - s.present;
        s.percentage = s.total ? ((s.present / s.total) * 100).toFixed(1) : 0;
      });
      setReport(final);
      setShowReport(true);
    } catch (err) {
      console.error(err);
      showAlert("Error fetching report", "danger");
    } finally {
      setLoading(false);
    }
  };

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();

    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, pageW, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ATTENDANCE REPORT", pageW / 2, 11, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Department: ${department}   |   Year: ${year}   |   ${fromDate} to ${toDate}`, pageW / 2, 21, { align: "center" });

    const classAvgVal = report.length
      ? (report.reduce((a, b) => a + Number(b.percentage), 0) / report.length).toFixed(1)
      : 0;
    const defCount = report.filter(r => r.percentage < 75).length;

    const boxes = [
      { label: "Total Students", val: report.length },
      { label: "Working Days",   val: workingDays || "-" },
      { label: "Class Average",  val: classAvgVal + "%" },
      { label: "Defaulters",     val: defCount },
    ];
    boxes.forEach((b, i) => {
      const x = 14 + i * 45;
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(x, 32, 42, 16, 2, 2, "F");
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(37, 99, 235);
      doc.text(String(b.val), x + 21, 42, { align: "center" });
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(b.label, x + 21, 47, { align: "center" });
    });

    autoTable(doc, {
      startY: 54,
      head: [["#", "Roll No", "Name", "Present", "Absent", "Total", "Percentage"]],
      body: report.map((r, i) => [i + 1, r.roll, r.name, r.present, r.absent, r.total, r.percentage + "%"]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      didParseCell: (data) => {
        if (data.column.index === 6 && data.section === "body") {
          const p = parseFloat(data.cell.raw);
          data.cell.styles.textColor = p >= 75 ? [22, 163, 74] : p >= 60 ? [217, 119, 6] : [220, 38, 38];
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
        pageW / 2,
        doc.internal.pageSize.getHeight() - 8,
        { align: "center" }
      );
    }
    doc.save(`Attendance_${department}_Year${year}.pdf`);
  };

  // Excel Export
  const exportExcel = () => {
    const data = [
      { "Dept": department, "Year": year, "From": fromDate, "To": toDate },
      {},
      ...report.map(r => ({
        "Roll No": r.roll, "Name": r.name,
        "Present": r.present, "Absent": r.absent,
        "Total": r.total, "Percentage": r.percentage + "%"
      }))
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_${department}_Year${year}.xlsx`);
  };

  const classAvg = report.length
    ? (report.reduce((a, b) => a + Number(b.percentage), 0) / report.length).toFixed(1)
    : 0;
  const defaulters = report.filter(r => r.percentage < 75);
  const filtered = report.filter(r =>
    r.roll?.toLowerCase().includes(search.toLowerCase()) ||
    r.name?.toLowerCase().includes(search.toLowerCase())
  );
  const displayData = showDefaulters ? defaulters : filtered;

  const toastColors = {
    danger:  { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" },
    warning: { bg: "#fef9c3", color: "#854d0e", border: "#fde047" },
    info:    { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" },
    success: { bg: "#dcfce7", color: "#14532d", border: "#86efac" },
  };

  const deptCfg = DEPT_CONFIG[department] || { emoji: "🏫", color: "#2563eb" };
  const allowedYears = getAllowedYears(department);

  // ── Role badge ────────────────────────────────────────────
  const RoleBadge = () => {
    if (roleInfo.role === "admin") return (
      <span style={{ background: "#1e3a8a", color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600 }}>
        🛡 Admin — All Departments
      </span>
    );
    if (roleInfo.role === "hod") return (
      <span style={{ background: deptCfg.color, color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600 }}>
        {deptCfg.emoji} HOD — {roleInfo.allowedDepts[0]}
      </span>
    );
    return (
      <span style={{ background: "#7c3aed", color: "#fff", borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 600 }}>
        👤 Staff — {roleInfo.allowedDepts.join(", ")}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "16px 12px", fontFamily: "system-ui,sans-serif" }}>

      <style>{`
        @keyframes slideUp { from { transform:translateY(20px);opacity:0 } to { transform:translateY(0);opacity:1 } }
        @keyframes calPop  { from { transform:translateY(-8px);opacity:0 } to { transform:translateY(0);opacity:1 } }
        .stu-card          { cursor:pointer;transition:all 0.18s;border:1px solid #e2e8f0;border-radius:10px;padding:12px 16px;background:#fff;display:flex;justify-content:space-between;align-items:center; }
        .stu-card:hover    { border-color:#2563eb;box-shadow:0 4px 16px rgba(37,99,235,0.12);transform:translateY(-1px); }
        .act-btn           { border:none;border-radius:8px;padding:0 16px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.15s;height:36px; }
        .act-btn:hover     { opacity:0.88;transform:translateY(-1px); }
        .act-btn:disabled  { opacity:0.5;cursor:not-allowed;transform:none; }
        .readonly-pill     { height:38px;display:flex;align-items:center;padding:0 12px;border-radius:8px;background:#f1f5f9;font-weight:700;font-size:13px;gap:6px;border:1px solid #e2e8f0; }
      `}</style>

      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <div style={{ background: "#1e3a5f", borderRadius: 10, padding: "8px 12px", fontSize: 18 }}>📊</div>
        <div>
          <h3 style={{ margin: 0, color: "#1e3a5f", fontWeight: 700, fontSize: 21 }}>Attendance Reports</h3>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>Generate and export department-wise attendance reports</div>
        </div>
      </div>

      {/* Role badge */}
      <div style={{ marginBottom: 16 }}>
        <RoleBadge />
      </div>

      {/* Toast */}
      {showToast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 99999,
          background: toastColors[showToast.type]?.bg,
          color: toastColors[showToast.type]?.color,
          border: `1px solid ${toastColors[showToast.type]?.border}`,
          borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", animation: "slideUp 0.2s ease",
          maxWidth: 320
        }}>
          {showToast.msg}
        </div>
      )}

      {/* Filter Card */}
      <div style={{
        background: "#fff", borderRadius: 14, padding: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 20,
        border: "1px solid #e2e8f0"
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 14, letterSpacing: "0.5px" }}>
          FILTER OPTIONS
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, alignItems: "end" }}>

          {/* ── DEPARTMENT ── */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 4, letterSpacing: "0.5px" }}>DEPARTMENT</div>

            {/* Admin / HOD with multiple depts → dropdown */}
            {roleInfo.allowedDepts.length > 1 ? (
              <select
                value={department}
                onChange={e => { setDepartment(e.target.value); setShowReport(false); setReport([]); }}
                style={{ height: 38, width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: "0 10px", fontSize: 13, background: "#f8fafc", color: "#1e293b" }}
              >
                <option value="">Select dept</option>
                {roleInfo.allowedDepts.map(d => (
                  <option key={d} value={d}>{DEPT_CONFIG[d]?.emoji} {d}</option>
                ))}
              </select>
            ) : (
              /* HOD (single dept) or Staff (single dept) → read-only pill */
              <div className="readonly-pill" style={{ color: deptCfg.color }}>
                {deptCfg.emoji} {department || "—"}
              </div>
            )}
          </div>

          {/* ── YEAR ── */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginBottom: 4, letterSpacing: "0.5px" }}>YEAR</div>

            {allowedYears.length === 1 ? (
              /* Staff assigned to only 1 year for this dept → read-only */
              <div className="readonly-pill" style={{ color: "#2563eb" }}>
                {YEAR_LABELS[allowedYears[0]]}
              </div>
            ) : (
              <select
                value={year}
                onChange={e => { setYear(e.target.value); setShowReport(false); setReport([]); }}
                disabled={!department}
                style={{ height: 38, width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: "0 10px", fontSize: 13, background: !department ? "#f1f5f9" : "#f8fafc", color: "#1e293b" }}
              >
                <option value="">Select year</option>
                {allowedYears.map(y => (
                  <option key={y} value={y}>{YEAR_LABELS[y]}</option>
                ))}
              </select>
            )}
          </div>

          {/* From Date */}
          <CalendarPopover
            label="FROM DATE"
            value={fromDate}
            onChange={val => handleSmartDate("from", val)}
            fromDate={fromDate}
            toDate={toDate}
          />

          {/* To Date */}
          <CalendarPopover
            label="TO DATE"
            value={toDate}
            onChange={val => handleSmartDate("to", val)}
            fromDate={fromDate}
            toDate={toDate}
          />

          {/* View Button */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "transparent", marginBottom: 4 }}>.</div>
            <button
              className="act-btn"
              onClick={calculateReport}
              disabled={loading}
              style={{ background: "#1e3a5f", color: "#fff", width: "100%", height: 38 }}
            >
              {loading ? "Loading..." : "View Report"}
            </button>
          </div>

        </div>

        {/* Working days badge */}
        {workingDays !== null && (
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{
              background: "#eff6ff", borderRadius: 8, padding: "6px 14px",
              fontSize: 13, color: "#1d4ed8", fontWeight: 500,
              display: "inline-flex", alignItems: "center", gap: 6
            }}>
              📅 Working Days: <strong>{workingDays}</strong>
            </div>
            {fromDate && toDate && (
              <div style={{
                background: "#f0fdf4", borderRadius: 8, padding: "6px 14px",
                fontSize: 13, color: "#15803d", fontWeight: 500,
                display: "inline-flex", alignItems: "center", gap: 6
              }}>
                📆 {fromDate} → {toDate}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Section */}
      {showReport && (
        <>
          {/* Summary Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Total Students",   val: report.length,     color: "#2563eb", bg: "#eff6ff" },
              { label: "Class Average",    val: classAvg + "%",    color: "#16a34a", bg: "#f0fdf4" },
              { label: "Defaulters < 75%", val: defaulters.length, color: "#dc2626", bg: "#fef2f2" },
              { label: "Working Days",     val: workingDays || "-",color: "#d97706", bg: "#fffbeb" },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg, borderRadius: 10, padding: "12px 16px",
                border: `1px solid ${s.color}22`
              }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
            <input
              placeholder="🔍  Search by name or roll no..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, minWidth: 180, height: 36,
                border: "1px solid #cbd5e1", borderRadius: 8,
                padding: "0 12px", fontSize: 13, background: "#f8fafc"
              }}
            />
            <button
              className="act-btn"
              onClick={() => setShowDefaulters(!showDefaulters)}
              style={{
                background: showDefaulters ? "#dc2626" : "#fef2f2",
                color:      showDefaulters ? "#fff"    : "#dc2626",
              }}
            >
              {showDefaulters ? "Show All" : `⚠ Defaulters (${defaulters.length})`}
            </button>
            <button className="act-btn" onClick={exportPDF}   style={{ background: "#dc2626", color: "#fff" }}>📄 PDF</button>
            <button className="act-btn" onClick={exportExcel} style={{ background: "#16a34a", color: "#fff" }}>📊 Excel</button>
          </div>

          {/* Dept label */}
          <div style={{ fontWeight: 600, fontSize: 13, color: "#475569", marginBottom: 10 }}>
            {DEPT_CONFIG[department]?.emoji} {department} Dept — {YEAR_LABELS[year]} — {displayData.length} students
          </div>

          {/* Student Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {displayData.map((r, i) => {
              const p = Number(r.percentage);
              const color = p >= 75 ? "#16a34a" : p >= 60 ? "#d97706" : "#dc2626";
              const bg    = p >= 75 ? "#f0fdf4" : p >= 60 ? "#fffbeb" : "#fef2f2";
              return (
                <div key={r.roll} className="stu-card" onClick={() => setSelectedStudent(r)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: "#eff6ff", display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: 700, color: "#2563eb", fontSize: 13, flexShrink: 0
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#1e293b" }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{r.roll}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#94a3b8" }}>P / A / T</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                        {r.present} / {r.absent} / {r.total}
                      </div>
                    </div>
                    <div style={{
                      background: bg, color, borderRadius: 8,
                      padding: "6px 14px", fontWeight: 700, fontSize: 15,
                      minWidth: 62, textAlign: "center"
                    }}>
                      {p}%
                    </div>
                    <span style={{ color: "#94a3b8", fontSize: 18 }}>›</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Student Modal */}
      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          department={department}
          year={year}
        />
      )}
    </div>
  );
};

export default Reports;