import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import axios from "axios";

const Reports = () => {

const [department,setDepartment]=useState("")
const [year,setYear]=useState("")
const [fromDate,setFromDate]=useState("")
const [toDate,setToDate]=useState("")
const [showReport,setShowReport]=useState(false)
const [report,setReport]=useState([])
const [workingDays,setWorkingDays]=useState(null)
const [showToast,setShowToast]=useState(null)
const [search,setSearch]=useState("")
const [showDefaulters,setShowDefaulters]=useState(false)

const holidays=[
{date:"2025-01-26",name:"Republic Day"},
{date:"2025-08-15",name:"Independence Day"},
{date:"2025-10-02",name:"Gandhi Jayanti"},
{date:"2025-12-25",name:"Christmas"}
]

useEffect(()=>{
const today=new Date().toISOString().split("T")[0]
setToDate(today)
},[])

const showAlert=(msg,type="info")=>{
setShowToast({msg,type})
setTimeout(()=>setShowToast(null),2500)
}

const handleSmartDate=(type,value)=>{

const dateObj=new Date(value)

if(dateObj>new Date()){
showAlert("Future date not allowed","danger")
return
}

if(dateObj.getDay()===0){
showAlert("Sunday is holiday","danger")
return
}

const holiday=holidays.find(h=>h.date===value)

if(holiday){
showAlert(`${holiday.name} Holiday`,"warning")
return
}

type==="from"?setFromDate(value):setToDate(value)

}

useEffect(()=>{

if(!fromDate || !toDate) return

const s=new Date(fromDate)
const e=new Date(toDate)

let count=0
const temp=new Date(s)

while(temp<=e){

const d=temp.getDay()
const dStr=temp.toISOString().split("T")[0]
const isHoliday=holidays.some(h=>h.date===dStr)

if(d!==0 && d!==6 && !isHoliday) count++

temp.setDate(temp.getDate()+1)

}

setWorkingDays(count)

},[fromDate,toDate])

// FETCH REPORT
const calculateReport = async () => {

if (!department || !year || !fromDate || !toDate) {
showAlert("Fill all fields","danger")
return
}

try {

const res = await axios.get("http://localhost:3001/api/attendance/report",{
params:{
department,
year,
from:fromDate,
to:toDate
}
})

const records = res.data

if(!records.length){
showAlert("No attendance data","danger")
return
}

const final=[]

records.forEach(rec=>{

rec.attendance.forEach(a=>{

const roll = a.studentId?.regNo
const name = a.studentId?.name

let stu = final.find(s=>s.roll===roll)

if(!stu){
stu={
roll,
name,
present:0,
total:0
}
final.push(stu)
}

stu.total++

if(a.status==="Present"){
stu.present++
}

})

})

final.forEach(s=>{
s.absent=s.total-s.present
s.percentage=s.total?
((s.present/s.total)*100).toFixed(1):0
})

setReport(final)
setShowReport(true)

}catch(err){

console.error(err)
showAlert("Error fetching report","danger")

}

}

// EXPORT EXCEL
const exportExcel=()=>{

const data=[{Department:department,Year:year},{},...report]

const ws=XLSX.utils.json_to_sheet(data)
const wb=XLSX.utils.book_new()

XLSX.utils.book_append_sheet(wb,ws,"Attendance")

XLSX.writeFile(wb,"Attendance_Report.xlsx")

}

// EXPORT PDF
const exportPDF=()=>{

const doc=new jsPDF()

doc.text(`Attendance Report`,20,20)
doc.text(`Department : ${department}`,20,30)
doc.text(`Year : ${year}`,120,30)

let y=40

report.forEach(r=>{

doc.text(`${r.roll} ${r.name} ${r.present}/${r.total} ${r.percentage}%`,20,y)

y+=10

})

doc.save("Attendance_Report.pdf")

}

// SEARCH
const filtered = report.filter(r =>
r.roll?.toLowerCase().includes(search.toLowerCase()) ||
r.name?.toLowerCase().includes(search.toLowerCase())
)

const defaulters = report.filter(r=>r.percentage<75)

const classAvg=report.length?
(report.reduce((a,b)=>a+Number(b.percentage),0)/report.length).toFixed(1):0

const displayData=showDefaulters?defaulters:filtered

return(

<section className="container py-3" style={{maxWidth:"1100px"}}>

<h3 className="fw-bold text-primary mb-3">
Attendance Reports
</h3>

{showToast &&(
<div className={`alert alert-${showToast.type}`}>
{showToast.msg}
</div>
)}

<div className="card p-3 shadow-sm mb-3">

<div className="row g-2">

<div className="col-md-2">

<select className="form-select"
value={department}
onChange={e=>setDepartment(e.target.value)}>

<option value="">Department</option>
<option value="CSE">CSE</option>
<option value="ECE">ECE</option>
<option value="EEE">EEE</option>
<option value="MECH">MECH</option>
<option value="CIVIL">CIVIL</option>

</select>

</div>

<div className="col-md-2">

<select className="form-select"
value={year}
onChange={e=>setYear(e.target.value)}>

<option value="">Year</option>
<option value="1">1</option>
<option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>

</select>

</div>

<div className="col-md-3">

<input
type="date"
className="form-control"
value={fromDate}
onChange={e=>handleSmartDate("from",e.target.value)}
/>

</div>

<div className="col-md-3">

<input
type="date"
className="form-control"
value={toDate}
onChange={e=>handleSmartDate("to",e.target.value)}
/>

</div>

<div className="col-md-2 d-grid">

<button
className="btn btn-success"
onClick={calculateReport}
>
View
</button>

</div>

</div>

</div>

{workingDays!==null &&

<div className="alert alert-info text-center">
Working Days : {workingDays}
</div>

}

{showReport &&(

<>

<div className="fw-bold text-primary mb-2">

Department : {department} &nbsp;&nbsp;
Year : {year}

</div>

<input
className="form-control mb-2"
placeholder="Search by Roll or Name"
value={search}
onChange={e=>setSearch(e.target.value)}
/>

<div className="mb-2">

<button
className="btn btn-outline-primary me-2"
onClick={exportExcel}
>
Export Excel
</button>

<button
className="btn btn-outline-danger"
onClick={exportPDF}
>
Export PDF
</button>

</div>

<table className="table table-hover">

<thead className="table-primary">

<tr>

<th>Roll</th>
<th>Name</th>
<th>Present</th>
<th>Absent</th>
<th>Total</th>
<th>%</th>

</tr>

</thead>

<tbody>

{displayData.map(r=>(

<tr key={r.roll}>

<td>{r.roll}</td>
<td>{r.name}</td>
<td>{r.present}</td>
<td>{r.absent}</td>
<td>{r.total}</td>
<td>{r.percentage}%</td>

</tr>

))}

</tbody>

</table>

</>

)}

</section>

)

}

export default Reports