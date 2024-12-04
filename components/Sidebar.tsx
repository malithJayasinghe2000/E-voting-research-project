import { color } from "highcharts";

const Sidebar: React.FC<{ divisions: string[] }> = ({ divisions }) => {
    return (
      <div
        style={{
          backgroundColor: "#f9f9f9",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <h4 style={{backgroundColor: "#ffffff",color:"#d82b06", fontStyle:"Bold",textAlign:"center", }}>LATEST RELEASED RESULTS</h4>
        <div  style={{
              fontWeight: "bold",
              fontSize: "16px",
              color: "#000000",
              marginBottom: "5px",
              backgroundColor:"#7e857c",
              padding:"10px"
            }}> Polling Divisions</div>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {divisions.map((division, index) => (
            <li key={index} style={{ marginBottom: "10px" }}>
              <a href={`#${division}`} style={{ textDecoration: "none", color: "#333" }}>
                {division}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default Sidebar;
  