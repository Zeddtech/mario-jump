import "./Obstacles.css";
import obstacle1 from "../../../assets/img/gif/goombla.gif";
import obstacle2 from "../../../assets/img/gif/koopa.gif";
import { useRef, useEffect } from "react";

// redux
import { useDispatch, useSelector } from "react-redux";
import {
  obstacle1Height,
  obstacle1Left,
  obstacle1Top,
  obstacle1Width,
  obstacle2Height,
  obstacle2Left,
  obstacle2Top,
  obstacle2Width
} from "../../../config/redux/obstacleSlice";
import { setSpeed } from "../../../config/redux/engineSlice";

const Obstacles = () => {
  const dispatch = useDispatch();
  const isPlay = useSelector((state) => state.engine.play);
  const speed = useSelector((state) => state.engine.speed);

  const obstacle1Ref = useRef(null);
  const obstacle2Ref = useRef(null);

  // 🔹 Update obstacles position smoothly with requestAnimationFrame
  useEffect(() => {
    let frameId;

    const updatePositions = () => {
      if (obstacle1Ref.current) {
        const rect1 = obstacle1Ref.current.getBoundingClientRect();
        dispatch(obstacle1Height(rect1.height));
        dispatch(obstacle1Left(rect1.left));
        dispatch(obstacle1Top(rect1.top));
        dispatch(obstacle1Width(rect1.width));
      }

      if (obstacle2Ref.current) {
        const rect2 = obstacle2Ref.current.getBoundingClientRect();
        dispatch(obstacle2Height(rect2.height));
        dispatch(obstacle2Left(rect2.left));
        dispatch(obstacle2Top(rect2.top));
        dispatch(obstacle2Width(rect2.width));
      }

      frameId = requestAnimationFrame(updatePositions);
    };

    if (isPlay) {
      frameId = requestAnimationFrame(updatePositions);
    }

    return () => cancelAnimationFrame(frameId);
  }, [dispatch, isPlay]);

  // 🔹 Prevent speed from going negative
  useEffect(() => {
    if (speed < 0.0001) {
      dispatch(setSpeed(0.0001));
    }
  }, [speed, dispatch]);
  
  // 🔹 Adjust speed as game progress
  useEffect(()=>{
    if (!isPlay) return;
    const interval=setInterval(()=>{
      dispatch(setSpeed((prevSpeed)=>prevSpeed+0.05))
    },5000)
    return () => clearInterval(interval);
  }, [isPlay, dispatch]);

  return (
    <div className="obstacles-container">
      <img
        src={obstacle1}
        alt="Goombla"
        className={isPlay ? "obstacle1 obstacle1-move" : "obstacle1"}
        style={{ animationDuration: isPlay ? `${4 - Math.min(speed, 3.9)}s` : "4s" }}
        ref={obstacle1Ref}
      />
      <img
        src={obstacle2}
        alt="Koopa"
        className={isPlay ? "obstacle2 obstacle2-move" : "obstacle2"}
        style={{ animationDuration: isPlay ? `${8 - Math.min(speed, 7.9)}s` : "8s" }}
        ref={obstacle2Ref}
      />
    </div>
  );
};

export default Obstacles;