import "./Mario.css";
import MarioCharacter from "../../../assets/img/gif/mario-run.gif";
import stickman from "../../../assets/img/gif/monad-run.gif"
import stickman2 from "../../../assets/img/gif/monad-run2.gif"
import { useEffect, useRef, useCallback, useMemo } from "react";
import jumpAudio from "../../../assets/audio/mario-jump.mp3";
import backgroundMusic from "../../../assets/audio/running-about.mp3";
// redux
import { useDispatch, useSelector } from "react-redux";
import {
  marioJumping,
  marioHeight,
  marioLeft,
  marioTop,
  marioWidth,
} from "../../../config/redux/marioSlice";
import { setReady, setDie, setScore } from "../../../config/redux/engineSlice";
// die
import dieAudio from "../../../assets/audio/mario-died.mp3";

const Mario = () => {
  const marioRef = useRef();
  const dispatch = useDispatch();
  const die = useSelector((state) => state.engine.die);
  const loadingScreen = useSelector((state) => state.engine.loadingScreen);
  const isPlay = useSelector((state) => state.engine.play);

  // Mario positions & jump
  const mario_jump   = useSelector((state) => state.mario.jumping);
  const mario_height = useSelector((state) => state.mario.height);
  const mario_left   = useSelector((state) => state.mario.left);
  const mario_top    = useSelector((state) => state.mario.top);
  const mario_width  = useSelector((state) => state.mario.width);

  // Obstacle1 positions
  const obs1_height = useSelector((state) => state.obstacle.obs1Height);
  const obs1_left   = useSelector((state) => state.obstacle.obs1Left);
  const obs1_top    = useSelector((state) => state.obstacle.obs1Top);
  const obs1_width  = useSelector((state) => state.obstacle.obs1Width);
  // Obstacle2 positions
  const obs2_height = useSelector((state) => state.obstacle.obs2Height);
  const obs2_left   = useSelector((state) => state.obstacle.obs2Left);
  const obs2_top    = useSelector((state) => state.obstacle.obs2Top);
  const obs2_width  = useSelector((state) => state.obstacle.obs2Width);

  // Audio (memoized)
  const jump = useMemo(() => new Audio(jumpAudio), []);
  const marioDie = useMemo(() => new Audio(dieAudio), []);
  const bgMusic = useMemo(() => new Audio(backgroundMusic), []);

  // Handling key press event.
  const handleKey = useCallback(
    (e) => {
      if (e.code === "Enter" && !isPlay && !die && !loadingScreen) {
        dispatch(setReady(true));
      }
      if (!mario_jump && e.code === "Space" && isPlay && !die && !loadingScreen) {
        dispatch(marioJumping(true));
        jump.play();
        setTimeout(() => {
          dispatch(marioJumping(false));
          jump.pause();
          jump.currentTime = 0;
        }, 400);
      }
    },
    [mario_jump, jump, dispatch, isPlay, die, loadingScreen]
  );


  useEffect(() => {
    if (!isPlay) return;
    let frameId;
    const updateMarioBounds = () => {
      if (marioRef.current) {
        const rect = marioRef.current.getBoundingClientRect();
        dispatch(marioHeight(rect.height));
        dispatch(marioLeft(rect.left));
        dispatch(marioTop(rect.top));
        dispatch(marioWidth(rect.width));
      }
      frameId = requestAnimationFrame(updateMarioBounds);
    };
    frameId = requestAnimationFrame(updateMarioBounds);
    return () => cancelAnimationFrame(frameId);
  }, [isPlay, dispatch]);

  // Collision detection 
  useEffect(() => {
    if (
      mario_left < obs1_left + obs1_width &&
      mario_left + mario_width > obs1_left &&
      mario_top < obs1_top + obs1_height &&
      mario_top + mario_height > obs1_top
    ) {
      dispatch(setDie(true));
      marioDie.play();
      dispatch(setReady(false));
      setTimeout(() => { dispatch(setDie(false)); }, 2000);
      setTimeout(() => { dispatch(setScore(0)); }, 100);
    }

    if (
      mario_left < obs2_left + obs2_width && mario_left + mario_width > obs2_left &&
      mario_top < obs2_top + obs2_height &&
      mario_top + mario_height > obs2_top
    ) {
      dispatch(setDie(true));
      marioDie.play();
      dispatch(setReady(false));
      setTimeout(() => { dispatch(setDie(false)); }, 2000);
      setTimeout(() => { dispatch(setScore(0)); }, 100);
    }
  }, [
    mario_left, mario_width, mario_top, mario_height,
    obs1_left, obs1_width, obs1_top, obs1_height,
    obs2_left, obs2_width, obs2_top, obs2_height,
    dispatch, marioDie
  ]);

  // Monitor key press + initial bounds + music 
  useEffect(() => {
    document.addEventListener("keydown", handleKey);

    // Initial snapshot 
    if (marioRef.current) {
      const rect = marioRef.current.getBoundingClientRect();
      dispatch(marioHeight(rect.height));
      dispatch(marioLeft(rect.left));
      dispatch(marioTop(rect.top));
      dispatch(marioWidth(rect.width));
    }

    if (isPlay) {
      bgMusic.loop = true;
      bgMusic.play().catch(() => {/* autoplay might be blocked */});
    } else {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }

    //cleanup the key listener to avoid leaks/duplicates
    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [handleKey, dispatch, bgMusic, isPlay]);

  return (
    <div className="mario-container">
      {!die && (
        <img
          src={stickman2}
          alt=""
          className={`mario ${mario_jump ? "jump" : ""}`}
          ref={marioRef}
        />
      )}
      {die && (
        <img
          src={stickman2}
          alt=""
          className={`mario ${die ? "die" : ""}`}
          ref={marioRef}
        />
      )}
    </div>
  );
};

export default Mario; 