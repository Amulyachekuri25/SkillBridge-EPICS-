import React, { useState } from "react";
import axios from "axios";

function Internships() {
  const [year, setYear] = useState(1);
  const [data, setData] = useState([]);

  const fetchInternships = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/internships?year=${year}`);
      setData(res.data);
    } catch (err) {
      alert("Failed to fetch internships");
    }
  };

  return (
    <div
    style={{width:"100vw",height:"100vh"}}>
      <h2>Internships</h2>
      <select value={year} onChange={(e) => setYear(e.target.value)}>
        <option value={1}>1st Year</option>
        <option value={2}>2nd Year</option>
        <option value={3}>3rd Year</option>
        <option value={4}>4th Year</option>
      </select>
      <button onClick={fetchInternships}>Search</button>
      <ul>
        {data.map((i) => (
          <li key={i.id}>
            <a href={i.link} target="_blank">{i.title}</a> at {i.company}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Internships;
