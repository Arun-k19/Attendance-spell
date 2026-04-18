import React, { useState, useEffect, useRef } from "react";
import { getAttendance, saveAttendance } from "../api/attendanceApi";
import { getStudentsByFilter } from "../api/studentApi";

// ─── CONFIG ─────────────────────────────────────────────────────────
const DEPT_CONFIG = {
  CSE:   { emoji: "💻", color: "#2563eb" },
  ECE:   { emoji: "📡", color: "#0891b2" },
  EEE:   { emoji: "⚡", color: "#dc2626" },
  IT:    { emoji: "🖥️", color: "#7c3aed" },
  MECH:  { emoji: "⚙️", color: "#b45309" },
  CIVIL: { emoji: "🏗️", color: "#15803d" },
};

const YEAR_LABELS  = { "1": "I Year", "2": "II Year", "3": "III Year", "4": "IV Year" };
const ALL_PERIODS  = [1, 2, 3, 4, 5, 6, 7, 8];

// ─── HOLIDAYS ────────────────────────────────────────────────────────
const HOLIDAYS = [
  { date: "2025-01-14", name: "Pongal" },
  { date: "2025-01-26", name: "Republic Day" },
  { date: "2025-04-10", name: "Good Friday" },
  { date: "2025-04-14", name: "Tamil New Year" },
  { date: "2025-05-01", name: "Labour Day" },
  { date: "2025-08-15", name: "Independence Day" },
  { date: "2025-10-02", name: "Gandhi Jayanti" },
  { date: "2025-11-05", name: "Diwali" },
  { date: "2025-12-25", name: "Christmas" },
];
const HOLIDAY_MAP = Object.fromEntries(HOLIDAYS.map(h => [h.date, h.name]));
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

// ─── ROLE DETECTION ──────────────────────────────────────────────────
/**
 * Returns info about the logged-in user:
 *
 * Admin  → { role:"admin",  allowedDepts: ALL, allowedYears: ALL }
 * HOD    → { role:"hod",    allowedDepts: [hodDept], allowedYears: ALL }
 * Staff  → { role:"staff",  allowedDepts: unique depts from subjects,
 *                            allowedYearsByDept: { CSE:["1","3"], ECE:["2"] } }
 *
 * Staff subjects array format (from ManageStaff): [{ name, year, department? }]
 * If `department` field is missing in subject, fallback to staff.department.
 */
const getRoleInfo = () => {
  const userData  = JSON.parse(localStorage.getItem("user")       || "{}");
  const hodData   = JSON.parse(localStorage.getItem("hodData")    || "{}");
  const staffData = JSON.parse(localStorage.getItem("staffData")  || "{}");

  const role = (userData?.role || "").toLowerCase(); // "admin" | "hod" | "staff" | "faculty"

  if (role === "admin") {
    return {
      role: "admin",
      allowedDepts: Object.keys(DEPT_CONFIG),
      allowedYearsByDept: null, // null = all years allowed for every dept
    };
  }

  if (role === "hod") {
    const dept = hodData?.department || userData?.department || "";
    return {
      role: "hod",
      allowedDepts: dept ? [dept] : Object.keys(DEPT_CONFIG),
      allowedYearsByDept: null,
    };
  }

  // Staff / Faculty
  // staffData.subjects = [{ name: "Maths", year: "1", department: "CSE" }, ...]
  // staffData.department = "CSE"  (primary dept – fallback if subject has no dept field)
  const subjects   = staffData?.subjects || userData?.subjects || [];
  const primaryDept = staffData?.department || userData?.department || "";

  if (!subjects.length) {
    // No subjects configured – fall back to primary dept, all years
    return {
      role: "staff",
      allowedDepts: primaryDept ? [primaryDept] : [],
      allowedYearsByDept: primaryDept ? { [primaryDept]: ["1","2","3","4"] } : {},
    };
  }

  // Build { dept -> Set<year> } from subjects
  const map = {};
  subjects.forEach(({ name, year, department }) => {
    if (!year) return;
    const dept = department || primaryDept;
    if (!dept) return;
    if (!map[dept]) map[dept] = new Set();
    map[dept].add(String(year));
  });

  // Convert Sets to arrays
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

// ─── CALENDAR POPOVER ────────────────────────────────────────────────
const CalendarPopover = ({ label, value, onChange }) => {
  const [open,     setOpen]     = useState(false);
  const [calMonth, setCalMonth] = useState(() => value ? new Date(value).getMonth()    : new Date().getMonth());
  const [calYear,  setCalYear]  = useState(() => value ? new Date(value).getFullYear() : new Date().getFullYear());
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today       = new Date().toISOString().split("T")[0];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const thisMonthHolidays = HOLIDAYS.filter(h => {
    const hd = new Date(h.date);
    return hd.getMonth() === calMonth && hd.getFullYear() === calYear;
  });

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); };

  const handleDayClick = (ds, dow, isHol) => {
    if (dow === 0) { alert("Sunday is a holiday — cannot mark attendance"); return; }
    if (isHol)    { alert(`${HOLIDAY_MAP[ds]} — Holiday`); return; }
    onChange(ds);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <label className="form-label fw-semibold text-muted" style={{ fontSize: "12px" }}>{label}</label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          height: 38, width: "100%",
          border: open ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
          borderRadius: 8, background: open ? "#eff6ff" : "#f8fafc",
          color: value ? "#1e293b" : "#94a3b8",
          padding: "0 10px", fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          boxShadow: open ? "0 0 0 3px #dbeafe" : "none",
          transition: "all 0.15s",
        }}
      >
        <span>📅</span>
        <span style={{ flex: 1, textAlign: "left" }}>{value || "Select date"}</span>
        <span style={{ color: "#94a3b8", fontSize: "11px" }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 9999,
          background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 12, boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          padding: 14, width: 264,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <button onClick={prevMonth} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>‹</button>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#1e3a5f" }}>{MONTH_SHORT[calMonth]} {calYear}</span>
            <button onClick={nextMonth} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", color: "#475569" }}>›</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d, i) => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 600, padding: "2px 0", color: i === 0 ? "#ef4444" : i === 6 ? "#3b82f6" : "#94a3b8" }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />;
              const mm  = String(calMonth + 1).padStart(2, "0");
              const dd  = String(day).padStart(2, "0");
              const ds  = `${calYear}-${mm}-${dd}`;
              const dow = new Date(calYear, calMonth, day).getDay();
              const isHol      = !!HOLIDAY_MAP[ds];
              const isSun      = dow === 0;
              const isSat      = dow === 6;
              const isSelected = ds === value;
              const isToday    = ds === today && !isSelected;

              let bg = "transparent", color = "#334155", fw = 400, cursor = "pointer", title = "";
              if (isHol)      { bg = "#fee2e2"; color = "#dc2626"; fw = 700; cursor = "not-allowed"; title = HOLIDAY_MAP[ds]; }
              else if (isSun) { color = "#ef4444"; cursor = "not-allowed"; }
              else if (isSat) { color = "#3b82f6"; }
              if (isSelected) { bg = "#1e3a5f"; color = "#fff"; fw = 700; }

              return (
                <div key={i} title={title} onClick={() => handleDayClick(ds, dow, isHol)}
                  style={{ textAlign: "center", borderRadius: 5, padding: "4px 0", background: bg, color, fontWeight: fw, fontSize: 11, cursor, transition: "background 0.1s", outline: isToday ? "2px solid #94a3b8" : "none", outlineOffset: "-1px" }}
                  onMouseEnter={(e) => { if (!isHol && !isSun && !isSelected) e.currentTarget.style.background = "#eff6ff"; }}
                  onMouseLeave={(e) => { if (!isHol && !isSun && !isSelected) e.currentTarget.style.background = bg || "transparent"; }}
                >{day}</div>
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
              { bg: "transparent", border: "#3b82f6", label: "Saturday ✅" },
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

// ─── MAIN PAGE ───────────────────────────────────────────────────────
export default function AttendancePage() {

  // ── Role info (computed once on mount) ──────────────────
  const roleInfo = getRoleInfo();
  // roleInfo = { role, allowedDepts, allowedYearsByDept }

  // ── State ────────────────────────────────────────────────
  const [department, setDepartment] = useState(() => {
    // If only one dept allowed, auto-select it
    return roleInfo.allowedDepts.length === 1 ? roleInfo.allowedDepts[0] : "";
  });
  const [year,       setYear]       = useState("");
  const [period,     setPeriod]     = useState("");
  const [subject,    setSubject]    = useState("");
  const [date,       setDate]       = useState("");

  const [students,          setStudents]          = useState([]);
  const [attendance,        setAttendance]         = useState({});
  const [isLoaded,          setIsLoaded]           = useState(false);
  const [alreadyMarked,     setAlreadyMarked]      = useState(false);
  const [attendanceRecords, setAttendanceRecords]  = useState([]);
  const [searchTerm,        setSearchTerm]         = useState("");
  const [submitting,        setSubmitting]         = useState(false);
  const [loading,           setLoading]            = useState(false);

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    fetchTakenPeriods();
  }, [department, year, date]);

  // ── Auto-select year if staff has only 1 year for selected dept ──
  useEffect(() => {
    if (!department) { setYear(""); return; }
    const allowed = getAllowedYears(department);
    if (allowed.length === 1) setYear(allowed[0]);
    else setYear("");
    setPeriod("");
    setIsLoaded(false);
  }, [department]);

  // ── Helper: get allowed years for a dept ────────────────
  const getAllowedYears = (dept) => {
    if (!roleInfo.allowedYearsByDept) return ["1","2","3","4"]; // admin/HOD = all years
    return roleInfo.allowedYearsByDept[dept] || [];
  };

  const fetchTakenPeriods = async () => {
    if (!department || !year || !date) return;
    try {
      const res = await getAttendance({ date, department, year });
      const records = res.data.map((r) => ({
        department: r.department,
        year: r.year,
        date: new Date(r.date).toISOString().split("T")[0],
        period: r.period,
      }));
      setAttendanceRecords(records);
    } catch (err) {
      console.error("Failed to fetch periods", err);
    }
  };

  const loadStudents = async () => {
    if (!department || !year || !period || !subject) {
      alert("Fill all fields");
      return;
    }
    setLoading(true);
    try {
      const check = await getAttendance({ date, department, year, period });
      if (check.data.length > 0) {
        setAlreadyMarked(true);
        setIsLoaded(false);
        alert("⚠ Attendance already marked for this period");
        setLoading(false);
        return;
      } else {
        setAlreadyMarked(false);
      }
      const res  = await getStudentsByFilter(department, year);
      const list = res.data.filter(
        (s) =>
          String(s.dept).toLowerCase() === department.toLowerCase() &&
          String(s.year) === String(year)
      );
      setStudents(list);
      const init = {};
      list.forEach((s) => (init[s.regNo] = "P"));
      setAttendance(init);
      setIsLoaded(true);
      setSearchTerm("");
    } catch (err) {
      console.error(err);
      alert("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendance = (regNo) => {
    setAttendance((prev) => ({ ...prev, [regNo]: prev[regNo] === "P" ? "A" : "P" }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach((s) => (updated[s.regNo] = status));
    setAttendance(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const payload = {
      date,
      department,
      year: Number(year),
      period: Number(period),
      subject,
      attendance: students.map((s) => ({
        regNo: s.regNo,
        status: attendance[s.regNo] === "P" ? "Present" : "Absent",
      })),
    };
    try {
      await saveAttendance(payload);
      alert("✅ Attendance Saved!");
      setIsLoaded(false);
      setPeriod("");
      fetchTakenPeriods();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Computed ──────────────────────────────────────────────
  const availablePeriods = ALL_PERIODS.filter((p) => {
    if (!department || !year) return true;
    return !attendanceRecords.some(
      (r) =>
        String(r.department).toLowerCase() === String(department).toLowerCase() &&
        String(r.year) === String(year) &&
        r.date === date &&
        Number(r.period) === Number(p)
    );
  });

  const completedPeriods = attendanceRecords
    .filter(
      (r) =>
        String(r.department).toLowerCase() === String(department).toLowerCase() &&
        String(r.year) === String(year) &&
        r.date === date
    )
    .map((r) => Number(r.period))
    .sort((a, b) => a - b);

  const filteredStudents  = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStudents     = students.length;
  const presentCount      = Object.values(attendance).filter((a) => a === "P").length;
  const absentCount       = totalStudents - presentCount;
  const attendancePercent = totalStudents ? Math.round((presentCount / totalStudents) * 100) : 0;
  const deptCfg           = DEPT_CONFIG[department] || { emoji: "🏫", color: "#2563eb" };

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "";

  // Allowed years for currently selected dept
  const allowedYears = getAllowedYears(department);

  // ── Render ────────────────────────────────────────────────
  return (
    <section className="container py-3" style={{ maxWidth: "1000px" }}>

      {/* HEADER */}
      <div className="mb-4">
        <h3 className="fw-bold text-primary mb-0">📋 Attendance</h3>
        {date && <small className="text-muted">{formattedDate}</small>}
        {/* Role badge */}
        <div className="mt-1">
          {roleInfo.role === "admin" && (
            <span className="badge" style={{ background: "#1e3a8a", color: "#fff", borderRadius: "20px", padding: "4px 12px", fontSize: "11px" }}>🛡 Admin — All Departments</span>
          )}
          {roleInfo.role === "hod" && (
            <span className="badge" style={{ background: deptCfg.color, color: "#fff", borderRadius: "20px", padding: "4px 12px", fontSize: "11px" }}>
              {deptCfg.emoji} HOD — {roleInfo.allowedDepts[0]}
            </span>
          )}
          {roleInfo.role === "staff" && (
            <span className="badge" style={{ background: "#7c3aed", color: "#fff", borderRadius: "20px", padding: "4px 12px", fontSize: "11px" }}>
              👤 Staff — {roleInfo.allowedDepts.join(", ")}
            </span>
          )}
        </div>
      </div>

      {/* FILTER CARD */}
      <div className="card shadow-sm border-0 p-4 mb-4" style={{ borderRadius: "16px" }}>
        <div className="row g-3">

          {/* Dept */}
          <div className="col-md-3">
            <label className="form-label fw-semibold text-muted" style={{ fontSize: "12px" }}>DEPARTMENT</label>
            {roleInfo.allowedDepts.length === 1 ? (
              // Only one dept → show as read-only pill
              <div className="form-control shadow-sm fw-bold d-flex align-items-center gap-2"
                style={{ background: "#f1f5f9", color: deptCfg.color, cursor: "default" }}>
                {deptCfg.emoji} {department}
              </div>
            ) : (
              <select className="form-select shadow-sm"
                value={department}
                onChange={(e) => { setDepartment(e.target.value); setIsLoaded(false); }}>
                <option value="">Select Dept</option>
                {roleInfo.allowedDepts.map((d) => (
                  <option key={d} value={d}>{DEPT_CONFIG[d]?.emoji} {d}</option>
                ))}
              </select>
            )}
          </div>

          {/* Year — filtered by staff's allowed years for selected dept */}
          <div className="col-md-2">
            <label className="form-label fw-semibold text-muted" style={{ fontSize: "12px" }}>YEAR</label>
            {allowedYears.length === 1 ? (
              // Only one year → show as read-only
              <div className="form-control shadow-sm fw-bold d-flex align-items-center gap-2"
                style={{ background: "#f1f5f9", color: "#2563eb", cursor: "default" }}>
                {YEAR_LABELS[allowedYears[0]]}
              </div>
            ) : (
              <select className="form-select shadow-sm"
                value={year}
                onChange={(e) => { setYear(e.target.value); setPeriod(""); setIsLoaded(false); }}
                disabled={!department}>
                <option value="">Year</option>
                {allowedYears.map((y) => (
                  <option key={y} value={y}>{YEAR_LABELS[y]}</option>
                ))}
              </select>
            )}
          </div>

          {/* Period */}
          <div className="col-md-2">
            <label className="form-label fw-semibold text-muted" style={{ fontSize: "12px" }}>PERIOD</label>
            <select className="form-select shadow-sm"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}>
              <option value="">Period</option>
              {availablePeriods.map((p) => (
                <option key={p} value={p}>Period {p}</option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div className="col-md-3">
            <label className="form-label fw-semibold text-muted" style={{ fontSize: "12px" }}>SUBJECT</label>
            <input className="form-control shadow-sm" placeholder="e.g. Maths, Physics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)} />
          </div>

          {/* Date */}
          <div className="col-md-2">
            <CalendarPopover label="DATE" value={date} onChange={(val) => { setDate(val); setIsLoaded(false); setPeriod(""); }} />
          </div>

        </div>

        {/* Load button */}
        <div className="mt-3 d-flex justify-content-end">
          <button
            className="btn fw-bold px-4 text-white"
            style={{ background: "linear-gradient(90deg,#2563eb,#1e3a8a)", borderRadius: "10px" }}
            onClick={loadStudents}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Loading...</>
              : "📥 Load Students"}
          </button>
        </div>
      </div>

      {/* COMPLETED PERIODS */}
      {completedPeriods.length > 0 && (
        <div className="card border-0 mb-3 p-3"
          style={{ borderRadius: "12px", background: "#fffbeb", borderLeft: "4px solid #f59e0b" }}>
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: "18px" }}>⚠️</span>
            <div>
              <div className="fw-semibold" style={{ color: "#92400e" }}>Periods already completed today</div>
              <div className="d-flex gap-1 flex-wrap mt-1">
                {completedPeriods.map((p) => (
                  <span key={p} className="badge"
                    style={{ background: "#fef3c7", color: "#92400e", borderRadius: "20px", padding: "4px 10px" }}>
                    Period {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALREADY MARKED */}
      {alreadyMarked && (
        <div className="card border-0 mb-3 p-3"
          style={{ borderRadius: "12px", background: "#fff1f2", borderLeft: "4px solid #dc2626" }}>
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: "18px" }}>🚫</span>
            <span className="fw-semibold" style={{ color: "#dc2626" }}>Attendance already marked for this period!</span>
          </div>
        </div>
      )}

      {/* STUDENT LIST */}
      {isLoaded && (
        <>
          {/* Stats bar */}
          <div className="card border-0 shadow-sm mb-3 p-3"
            style={{ borderRadius: "16px", background: "linear-gradient(90deg,#2563eb,#1e3a8a)", color: "white" }}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex gap-3">
                <div className="text-center">
                  <div className="fw-bold" style={{ fontSize: "22px" }}>{totalStudents}</div>
                  <small style={{ opacity: 0.8 }}>Total</small>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.3)" }} />
                <div className="text-center">
                  <div className="fw-bold" style={{ fontSize: "22px", color: "#86efac" }}>{presentCount}</div>
                  <small style={{ opacity: 0.8 }}>Present</small>
                </div>
                <div style={{ width: 1, background: "rgba(255,255,255,0.3)" }} />
                <div className="text-center">
                  <div className="fw-bold" style={{ fontSize: "22px", color: "#fca5a5" }}>{absentCount}</div>
                  <small style={{ opacity: 0.8 }}>Absent</small>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: `conic-gradient(#86efac ${attendancePercent * 3.6}deg, rgba(255,255,255,0.2) 0deg)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: "bold", fontSize: "14px",
                }}>
                  {attendancePercent}%
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm fw-bold" style={{ background: "#22c55e", color: "white", borderRadius: "8px" }} onClick={() => markAll("P")}>✅ All Present</button>
                  <button className="btn btn-sm fw-bold" style={{ background: "#ef4444", color: "white", borderRadius: "8px" }} onClick={() => markAll("A")}>❌ All Absent</button>
                </div>
              </div>
            </div>

            <div className="mt-3" style={{ background: "rgba(255,255,255,0.2)", borderRadius: "999px", height: 8 }}>
              <div style={{ width: `${attendancePercent}%`, height: "100%", background: "#86efac", borderRadius: "999px", transition: "width 0.4s ease" }} />
            </div>
          </div>

          {/* Info pills */}
          <div className="d-flex gap-2 flex-wrap mb-3">
            <span className="badge" style={{ background: deptCfg.color, color: "white", borderRadius: "20px", padding: "6px 14px", fontSize: "13px" }}>
              {deptCfg.emoji} {department} — {YEAR_LABELS[year]}
            </span>
            <span className="badge" style={{ background: "#f1f5f9", color: "#334155", borderRadius: "20px", padding: "6px 14px", fontSize: "13px" }}>🕐 Period {period}</span>
            <span className="badge" style={{ background: "#f1f5f9", color: "#334155", borderRadius: "20px", padding: "6px 14px", fontSize: "13px" }}>📚 {subject}</span>
            <span className="badge" style={{ background: "#f1f5f9", color: "#334155", borderRadius: "20px", padding: "6px 14px", fontSize: "13px" }}>📅 {date}</span>
          </div>

          {/* Search */}
          <div className="card shadow-sm border-0 p-3 mb-3" style={{ borderRadius: "12px" }}>
            <input className="form-control shadow-sm"
              placeholder="🔍  Search by name or reg no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {/* Student Cards */}
          <div className="row g-2 mb-4">
            {filteredStudents.map((s) => {
              const isPresent = attendance[s.regNo] === "P";
              return (
                <div key={s.regNo} className="col-md-6">
                  <div className="card border-0 shadow-sm" style={{
                    borderRadius: "14px",
                    borderLeft: `5px solid ${isPresent ? "#22c55e" : "#ef4444"}`,
                    background: isPresent ? "#f0fdf4" : "#fff1f2",
                    transition: "all 0.2s",
                  }}>
                    <div className="card-body d-flex justify-content-between align-items-center py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div style={{
                          width: 40, height: 40, borderRadius: "50%",
                          background: isPresent ? "#22c55e" : "#ef4444",
                          color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: "bold", fontSize: "14px", flexShrink: 0,
                        }}>
                          {getInitials(s.name)}
                        </div>
                        <div>
                          <div className="fw-semibold" style={{ fontSize: "14px" }}>{s.name}</div>
                          <small className="text-muted" style={{ fontFamily: "monospace" }}>{s.regNo}</small>
                        </div>
                      </div>
                      <button
                        className="btn fw-bold"
                        style={{ borderRadius: "10px", minWidth: "90px", background: isPresent ? "#22c55e" : "#ef4444", color: "white", border: "none", fontSize: "13px", transition: "all 0.2s" }}
                        onClick={() => toggleAttendance(s.regNo)}
                      >
                        {isPresent ? "✅ Present" : "❌ Absent"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit */}
          <button
            className="btn fw-bold w-100 py-3 text-white"
            style={{ background: alreadyMarked ? "#94a3b8" : "linear-gradient(90deg,#16a34a,#15803d)", borderRadius: "14px", fontSize: "16px", border: "none" }}
            onClick={handleSubmit}
            disabled={alreadyMarked || submitting}
          >
            {submitting
              ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
              : "💾 Submit Attendance"}
          </button>
        </>
      )}

      {/* Empty state */}
      {!isLoaded && !loading && (
        <div className="text-center py-5 text-muted">
          <div style={{ fontSize: 56 }}>📋</div>
          <p className="mt-2 fw-semibold">Select dept, year, period & subject then click Load</p>
        </div>
      )}

    </section>
  );
}