import React, { useState } from "react";
import axios from "axios";

function Courses() {
  const [skill, setSkill] = useState("");
  const [courses, setCourses] = useState([]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/courses?skill=${skill}`);
      setCourses(res.data);
    } catch (err) {
      alert("Failed to fetch courses");
    }
  };

  return (
    <div
    style={{width:"100vw",height:"100vh"}}>
      <h2>Courses</h2>
      <input type="text" placeholder="Enter Skill" value={skill} onChange={(e) => setSkill(e.target.value)} />
      <button onClick={fetchCourses}>Search</button>
      <ul>
        {courses.map((c) => (
          <li key={c.id}>
            <a href={c.link} target="_blank">{c.title}</a> by {c.provider} (Rank {c.rank})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Courses;
