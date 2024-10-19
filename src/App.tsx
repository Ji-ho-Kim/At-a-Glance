import "react-toastify/dist/ReactToastify.css";

import { signInAnonymously } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import { VictoryPie } from "victory";

import { auth, db } from "./firebase";

/** NOTE: 의도적으로 null를 리턴 하고 있음. */
function CustomLabel() {
  return null;
}

function App() {
  const COLOR_CODE = "#3944BC";

  const [tumblerCapacity, setTumblerCapacity] = useState<number>(0); // 최대 텀블러 용량 (단위: ml)
  const [currentTumblerCapacity, setCurrentTumblerCapacity] = useState<number>(0); // 현재 텀블러 용량 (단위: ml)
  const [willCurrentTumblerCapacity, setWillCurrentTumblerCapacity] =
    useState(0);
  const [data, setData] = useState([{ x: "", y: 0, color: "#fff" }]);
  const [isGood, setIsGood] = useState<boolean>(false);
  const [step, setStep] = useState(0);

  const isEventOn = useRef(false);
  const currentTumblerCapacityRef = useRef(0);
  const currentStepRef = useRef(0);

  const handleFirestore = async () => {
    try {
      await addDoc(collection(db, "logs"), {
        currentTumblerCapacity,
        tumblerCapacity,
        data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast("Firebase Firestore에 데이터가 저장되었습니다.");
    } catch (err) {
      console.error(err);

      toast("Firebase Firestore에 데이터를 저장 하는데 실패 했습니다.");
    }
  };

  const onSocket = () => {
    // 1. 텀블러의 최대 용량을 받는다. 단위는 mL
    // 2. 텅 빈 텀블러의 무게를 잰다. 단위는 g
    // 3. 최대 용량 + 텅 빈 텀블러 무게 = 100%
    // 4. 텀블러에 물을 채운다
    // 5. 텀블러의 무게를 잰다. 단위는 g
    // 6. (현재 용량 + 텅 빈 텀블러의 무게) / (최대 용량 + 텅 빈 텀블러 무게) * 100 = 결과%

    const socket = io("http://localhost:3010");

    socket.on("MY_DATA", (data) => {
      console.log("data: " + data);

      const calculated = Math.round(Math.abs(data)); // 단위는 g

      console.log("calculated: " + calculated);

      const kgFromLbs = calculated >= 5000 ? 5000 : calculated; // 로드 셀의 최대 측정량은 5kg, 단위는 g

      // console.log("currentTumblerCapacity: " + currentTumblerCapacity);
      console.log(
        "currentTumblerCapacityRef.current: " +
          currentTumblerCapacityRef.current
      );

      console.log("tumblerCapacity: " + tumblerCapacity);

      let myPercentage =
        (kgFromLbs / (tumblerCapacity + currentTumblerCapacityRef.current)) *
        100;
/*
      if (kgFromLbs >= tumblerCapacity) {
        myPercentage =
          ((kgFromLbs - currentTumblerCapacityRef.current) / tumblerCapacity) *
          100;
      }
*/
      if (myPercentage < 0) {
        myPercentage = 0;
      }

      console.log("myPercentage: " + Math.round(myPercentage));

      console.log("-".repeat(50));

      setWillCurrentTumblerCapacity(kgFromLbs);

      console.log("step: " + step);

      if (currentStepRef.current === 1) {
        currentTumblerCapacityRef.current = kgFromLbs;
      }

      setData((prev) => {
        const newData = {
          x: "",
          y: Math.round(myPercentage),
          color: COLOR_CODE,
        };

        const newData2 = {
          x: "",
          y: 100 - Math.round(myPercentage),
          color: "#fff",
        };

        return [newData, newData2];
      });
    });
  };

  useEffect(() => {
    if (tumblerCapacity !== 0 && !isEventOn.current && step === 1) {
      isEventOn.current = true;

      onSocket();
    }
  }, [tumblerCapacity, step, isEventOn]);

  useEffect(() => {
    try {
      signInAnonymously(auth).then((userCredential) => {
        if (userCredential.user) {
          return toast("안녕하세요! 텀블러 최대 용량을 설정 해보세요!");
        }

        return toast("Firebase에 오류가 있어요 😢");
      });
    } catch (err) {
      toast("Firebase에 오류가 있어요 😢");
    }
  }, []);

  const calculateLeft = (data: number) => {
    const stringified = data.toString();

    if (stringified.length === 1) {
      return 230;
    }

    if (stringified.length === 2) {
      return 210;
    }

    if (stringified.length === 3) {
      return 195;
    }
  };

  return (
    <>
      {step === 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <h1 style={{ fontSize: 64, fontWeight: "700", color: "#1A1A1A" }}>
            텀블러 최대 용량 설정
          </h1>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <input
              style={{
                width: 300,
                height: 64,
                fontSize: 32,
                textAlign: "center",
              }}
              type="text"
              onChange={(e) => {
                setTumblerCapacity(Number(e.target.value));
              }}
            />

            <div style={{ width: 16 }}></div>

            <p style={{ fontSize: 48 }}>mL</p>
          </div>

          <div style={{ height: 32 }} />

          <button
            style={{
              width: 150,
              height: 64,
              fontSize: 32,
              borderRadius: 8,
              border: 0,
              backgroundColor: COLOR_CODE,
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={() => {
              setStep(1);

              currentStepRef.current = 1;
            }}
          >
            설정
          </button>
        </div>
      )}

      {step === 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <h1 style={{ fontSize: 48 }}>
            무게 센서에 현재 빈 텀블러를 올려 보세요!
          </h1>

          <div style={{ height: 32 }} />

          <p>현재 텀블러 무게: {willCurrentTumblerCapacity.toFixed(0)}g</p>

          <div style={{ height: 32 }} />

          <button
            style={{
              width: 150,
              height: 64,
              fontSize: 32,
              borderRadius: 8,
              border: 0,
              backgroundColor: COLOR_CODE,
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={() => {
              setStep(-1);

              currentStepRef.current = -1;

              setIsGood(true);

              setCurrentTumblerCapacity(willCurrentTumblerCapacity);

              toast(
                `${willCurrentTumblerCapacity}g으로 현재 텀블러 무게가 설정 되었어요! 🥳`
              );
            }}
          >
            설정
          </button>
        </div>
      )}

      {isGood ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            paddingBottom: 64,
          }}
        >
          <h1>Percentage of water</h1>

          <div style={{ height: 10 }} />
          <p style={{ fontSize: 24 }}>
            설정된 최대 텀블러 용량: {tumblerCapacity}mL
            <br></br>
            설정된 현재 텀블러 무게: {currentTumblerCapacity}g
          </p>

          <div style={{ height: 10 }} />

          <button
            style={{
              width: 400,
              height: 64,
              fontSize: 32,
              borderRadius: 8,
              border: 0,
              backgroundColor: COLOR_CODE,
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={handleFirestore}
          >
            Firestore에 데이터 보내기
          </button>

          <div style={{ height: 32 }} />

          <div
            className="App"
            style={{
              display: "flex",
              position: "relative",
              width: 500,
              boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
            }}
          >
            <VictoryPie
              innerRadius={100}
              colorScale={data.map((d) => d.color)}
              data={data}
              labelComponent={<CustomLabel />}
              animate={true}
            />
            {/* top: 180,
    left: 195, */}

            <p
              style={{
                fontSize: 45,
                fontWeight: "700",
                position: "absolute",
                top: 180,
                left: calculateLeft(data[0].y),
                color: COLOR_CODE,
              }}
            >
              {data[0].y}%
            </p>
          </div>
        </div>
      ) : null}

      <ToastContainer />
    </>
  );
}

export default App;
