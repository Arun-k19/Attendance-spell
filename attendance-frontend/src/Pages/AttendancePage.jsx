import React, { useState, useEffect } from "react";
import { saveAttendance } from "../api/attendanceApi";
import { getStudentsByFilter } from "../api/studentApi";

const AttendancePage = () => {

  const [department,setDepartment] = useState("");
  const [year,setYear] = useState("");
  const [period,setPeriod] = useState("");
  const [subject,setSubject] = useState("");
  const [date,setDate] = useState("");

  const [students,setStudents] = useState([]);
  const [attendance,setAttendance] = useState({});
  const [isLoaded,setIsLoaded] = useState(false);

  const [attendanceRecords,setAttendanceRecords] = useState([]);

  const [searchTerm,setSearchTerm] = useState("");

  const allPeriods=[1,2,3,4,5,6,7,8];

  useEffect(()=>{
    setDate(new Date().toISOString().split("T")[0]);
  },[]);

  const loadStudents = async ()=>{

    if(!department || !year || !period || !subject){
      alert("Fill all fields");
      return;
    }

    try{

      const res = await getStudentsByFilter(department,year);

      if(!res || !res.data){
        alert("No students found");
        return;
      }

      const list = res.data.filter(
        (s)=>
          String(s.dept).toLowerCase() === department.toLowerCase() &&
          String(s.year) === String(year)
      );

      if(list.length===0){
        alert("No students found for selected class");
        return;
      }

      setStudents(list);

      const init={};
      list.forEach(s=>init[s.regNo]="P");

      setAttendance(init);
      setIsLoaded(true);

    }catch(err){

      console.error(err);
      alert("Failed to load students");

    }

  };


  const toggleAttendance=(regNo)=>{

    setAttendance(prev=>({
      ...prev,
      [regNo]: prev[regNo]==="P" ? "A":"P"
    }));

  };


  const handleSubmit=async()=>{

    const payload={
      date,
      department,
      year:Number(year),
      period:Number(period),
      subject,
      attendance:students.map(s=>({
        regNo:s.regNo,
        status:attendance[s.regNo]==="P" ? "Present":"Absent"
      }))
    };

    try{

      await saveAttendance(payload);

      setAttendanceRecords(prev=>[
        ...prev,
        {department,year,date,period:Number(period)}
      ]);

      alert("Attendance Saved");

      setIsLoaded(false);
      setPeriod("");

    }catch(err){

      console.error(err);
      alert("Failed to save attendance");

    }

  };


  const availablePeriods=allPeriods.filter(p=>{

    if(!department || !year) return true;

    const taken=attendanceRecords.find(r=>
      r.department===department &&
      r.year===year &&
      r.date===date &&
      r.period===p
    );

    return !taken;

  });


  const completedPeriods = attendanceRecords
    .filter(
      (r)=>
        r.department===department &&
        r.year===year &&
        r.date===date
    )
    .map(r=>r.period)
    .sort((a,b)=>a-b);


  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.regNo.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const totalStudents = students.length;
  const presentCount = Object.values(attendance).filter(a=>a==="P").length;
  const absentCount = totalStudents - presentCount;

  const attendancePercent = totalStudents
    ? Math.round((presentCount/totalStudents)*100)
    : 0;


  return(

  <div className="container mt-3">

    <h3>Manage Attendance</h3>

    <div className="row mb-3">

      <div className="col-md-3">

        <select
        className="form-select"
        value={department}
        onChange={(e)=>{
          setDepartment(e.target.value);
          setPeriod("");
        }}
        >

        <option value="">Department</option>
        <option>CSE</option>
        <option>ECE</option>
        <option>EEE</option>
        <option>MECH</option>
        <option>CIVIL</option>

        </select>

      </div>


      <div className="col-md-2">

        <select
        className="form-select"
        value={year}
        onChange={(e)=>{
          setYear(e.target.value);
          setPeriod("");
        }}
        >

        <option value="">Year</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>

        </select>

      </div>


      <div className="col-md-2">

        <select
        className="form-select"
        value={period}
        onChange={(e)=>setPeriod(e.target.value)}
        >

        <option value="">Period</option>

        {availablePeriods.map(p=>(
          <option key={p} value={p}>{p}</option>
        ))}

        </select>

      </div>


      <div className="col-md-3">

        <input
        className="form-control"
        placeholder="Subject"
        value={subject}
        onChange={(e)=>setSubject(e.target.value)}
        />

      </div>


      <div className="col-md-2">

        <button
        className="btn btn-primary w-100"
        onClick={loadStudents}
        >

        Load

        </button>

      </div>

    </div>


    {/* Period Warning */}

    {completedPeriods.length>0 && (

      <div className="alert alert-warning">

        ⚠ Periods already completed today: {completedPeriods.join(", ")}

      </div>

    )}


    {/* Search */}

    {isLoaded && (

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Search by RegNo or Name..."
        value={searchTerm}
        onChange={(e)=>setSearchTerm(e.target.value)}
      />

    )}


    {/* Summary */}

    {isLoaded && (

      <div className="alert alert-secondary">

        <strong>Total:</strong> {totalStudents} | 
        <strong> Present:</strong> {presentCount} | 
        <strong> Absent:</strong> {absentCount}

      </div>

    )}


    {/* Progress */}

    {isLoaded && (

      <div className="progress mb-3">

        <div
          className="progress-bar bg-success"
          style={{width:`${attendancePercent}%`}}
        >

          {attendancePercent}%

        </div>

      </div>

    )}


    {/* Students */}

    {isLoaded && filteredStudents.map(s=>(

      <div
        key={s.regNo}
        className={`card mb-2 ${
          attendance[s.regNo]==="A" ? "border-danger bg-light" : ""
        }`}
      >

        <div className="card-body d-flex justify-content-between">

          <div>
            <strong>{s.regNo}</strong>
            <div>{s.name}</div>
          </div>

          <button
          className={`btn ${
            attendance[s.regNo]==="P"
            ? "btn-success"
            : "btn-danger"
          }`}
          onClick={()=>toggleAttendance(s.regNo)}
          >

          {attendance[s.regNo]==="P" ? "Present":"Absent"}

          </button>

        </div>

      </div>

    ))}


    {isLoaded &&

    <button
    className="btn btn-success w-100 mt-3"
    onClick={handleSubmit}
    >

    Submit Attendance

    </button>

    }

  </div>

  );

};

export default AttendancePage;