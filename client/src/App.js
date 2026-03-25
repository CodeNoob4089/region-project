import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const jobColors = {
  검성: "#e74c3c",
  수호성: "#3498db",
  궁성: "#2ecc71",
  살성: "#9b59b6",
  마도성: "#f1c40f",
  정령성: "#1abc9c",
  치유성: "#ecf0f1",
  호법성: "#e67e22",
  기타: "#95a5a6"
};

// 🔥 화살표 버튼 (깔끔 버전)
const Arrow = ({ onClick, direction }) => (
  <div
    onClick={onClick}
    style={{
      position: "absolute",
      top: "45%",
      [direction === "left" ? "left" : "right"]: -30,
      zIndex: 2,
      cursor: "pointer",
      fontSize: 26,
      color: "white",
      background: "rgba(0,0,0,0.6)",
      borderRadius: "50%",
      width: 42,
      height: 42,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "0.2s"
    }}
  >
    {direction === "left" ? "‹" : "›"}
  </div>
);

function App() {
  const [grouped, setGrouped] = useState({});
  const scrollRefs = useRef({});

  useEffect(() => {
    axios.get("http://localhost:4000/api/legion")
      .then(res => {
        const members =
          res.data.members ||
          res.data.data?.members ||
          [];

        const groupedData = members.reduce((acc, cur) => {
          const job = cur.job || "기타";
          if (!acc[job]) acc[job] = [];
          acc[job].push(cur);
          return acc;
        }, {});

        Object.keys(groupedData).forEach(job => {
          groupedData[job].sort(
            (a, b) => (b.combat_power2 || 0) - (a.combat_power2 || 0)
          );
        });

        setGrouped(groupedData);
      });
  }, []);

  // 🔥 드래그 스크롤
  const enableDragScroll = (el) => {
    let isDown = false;
    let startY;
    let scrollTop;

    el.addEventListener("mousedown", (e) => {
      isDown = true;
      startY = e.pageY - el.offsetTop;
      scrollTop = el.scrollTop;
      el.style.cursor = "grabbing";
    });

    el.addEventListener("mouseleave", () => {
      isDown = false;
      el.style.cursor = "grab";
    });

    el.addEventListener("mouseup", () => {
      isDown = false;
      el.style.cursor = "grab";
    });

    el.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const y = e.pageY - el.offsetTop;
      const walk = (y - startY) * 1.5;
      el.scrollTop = scrollTop - walk;
    });
  };

const sliderSettings = {
  infinite: true,
  speed: 500,
  slidesToShow: 3,
  slidesToScroll: 1,

  swipe: true,
  draggable: true,
  swipeToSlide: true, // 🔥 핵심 추가

  nextArrow: <Arrow direction="right" />,
  prevArrow: <Arrow direction="left" />,

  responsive: [
    { breakpoint: 1200, settings: { slidesToShow: 2 } },
    { breakpoint: 800, settings: { slidesToShow: 1 } }
  ]
};

  return (
    <div style={{
      background: "#1e1e2f",
      minHeight: "100vh",
      padding: "20px 50px",
      color: "white"
    }}>
      <h1 style={{
        textAlign: "center",
        marginBottom: 30,
        letterSpacing: "1px"
      }}>
        ⚔️ 잔향 레기온
      </h1>

      {/* 🔥 핵심: 좌우 잘림 방지 */}
      <div style={{ padding: "0 20px" }}>
        <Slider {...sliderSettings}>
          {Object.keys(grouped).map(job => (
            <div key={job}>
              <div style={{
                background: "#2c2c3e",
                borderRadius: 16,
                padding: 15,
                margin: "0 6px",
                height: 500,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 8px 20px rgba(0,0,0,0.6)",
                transition: "0.2s"
              }}>
                <h2 style={{
                  borderBottom: `3px solid ${jobColors[job] || "#fff"}`,
                  paddingBottom: 5,
                  marginBottom: 10,
                  color: jobColors[job] || "#fff"
                }}>
                  {job}
                </h2>

                <div
                  ref={(el) => {
                    if (el && !scrollRefs.current[job]) {
                      scrollRefs.current[job] = el;
                      enableDragScroll(el);
                    }
                  }}
                  style={{
                    overflowY: "auto",
                    flex: 1,
                    cursor: "grab",
                    paddingRight: 5
                  }}
                  className="custom-scroll"
                >
                  {grouped[job].map((user, idx) => (
                    <div key={idx} style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.08)"
                    }}>
                      <span>{user.nickname}</span>
                      <span style={{ color: "#f39c12", fontWeight: "bold" }}>
                        {user.combat_power2?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.3);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.5);
        }
      `}</style>
    </div>
  );
}

export default App;