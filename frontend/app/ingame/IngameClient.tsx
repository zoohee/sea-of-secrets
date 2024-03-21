"use client";

import style from "./EventHandler.module.scss";

import React, { useState, useRef, useEffect } from "react";
import { OrbitControls, CameraControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import TWEEN from "@tweenjs/tween.js";

import usePiece from "~/store/piece";
import useCamera from "~/store/camera";
import useNickname from "~/store/nickname";
import useGameId from "~/store/gameId";

import Loading from "./components/Loading";
import Round from "./components/Round";
import Turn from "./components/Turn";

import Map from "./models/Map";
import Node from "./models/Node";
import Edge from "./models/Edge";
import Piece from "./models/Shiba";

import * as DUMMY_DATA from "../ingame/dummy-data";
import { gameSocket } from "~/sockets";

const { connect, send, subscribe, disconnect } = gameSocket;

// TODO: Canvas만 로딩됐다고 끝이 아니라 안에 모델, 텍스쳐도 다 로딩이 되어야함.
// 나중에 이 로딩을 상태관리로 만들자.
export default function IngameClient() {
  const { nickname } = useNickname();
  const { gameId, setGameId } = useGameId();
  const { camera, setCamera } = useCamera();
  const cameraControlRef = useRef<CameraControls | null>(null!);

  const [loading, setLoading] = useState(true);
  const [nowNode, setNowNode] = useState();
  const [nowNodePosition, setNowNodePosition] = useState([]);
  const [nextMoveableNodes, setNextMoveableNodes] = useState([]);
  const [nextNodeEdge, setNextNodeEdge] = useState([]);

  const [socketData, setSocketData] = useState<any>();
  const [type, setType] = useState("미정");
  const [treasures, setTreasures] = useState([]);
  const [pirateRoute, setPirateRoute] = useState([]);
  const [marineOneRoute, setMarineOneRoute] = useState([]);
  const [marineTwoRoute, setMarineTwoRoute] = useState([]);
  const [marineThreeRoute, setMarineThreeRoute] = useState([]);
  const [turn, setTurn] = useState(1);
  const [round, setRound] = useState(1);

  // 소켓 통신을 통해 받게 될 데이터
  const newMoveableNodes = [89, 106, 108, 126, 127, 128];
  const newNodeEdge = [
    [107, 309],
    [309, 106],
  ];

  // 말 이동 프레임별 업데이트
  const Tween = () => {
    useFrame(() => {
      TWEEN.update();
    });
    return null;
  };

  // 게임 시작 타이머 알림
  const gameStart = () => {
    alert(`직업 : ${type}`);
  };

  const onConnect = () => {
    console.log("인게임 소켓 연결 완료");
    const gameIdFromLocalStorage = localStorage.getItem("gameId");
    if (gameIdFromLocalStorage) {
      const localGameId = JSON.parse(gameIdFromLocalStorage).state.gameId;

      // 해당 룸코드를 구독
      subscribe(`/sub/${localGameId}`, message => {
        const data = JSON.parse(message.body);
        if (data) {
          setSocketData(data);
        }
      });
    }
  };

  useEffect(() => {
    setCamera(cameraControlRef.current);
  }, [cameraControlRef.current]);

  useEffect(() => {
    connect(onConnect);
    return () => {
      disconnect();
    };
  }, []);

  useEffect(() => {
    if (socketData) {
      console.log("socketData message : ", socketData.message);
      if (socketData.message === "RENDER_COMPLETE_ACCEPTED") {
        // 직업 세팅
        const players = socketData.game.players;
        const number = Object.keys(players).find(
          key => players[key] === nickname,
        );

        if (number === "0") {
          setType("pirate");
          setTreasures(socketData.game.treasures);
          // localStorage.setItem("type", "pirate");
          // localStorage.setItem(
          //   "treasures",
          //   JSON.stringify(socketData.game.treasures),
          // );
        } else if (number === "1") {
          setType("marineOne");
          // localStorage.setItem("type", "marineOne");
        } else if (number === "2") {
          setType("marineTwo");
          // localStorage.setItem("type", "marineTwo");
        } else if (number === "3") {
          setType("marineThree");
          // localStorage.setItem("type", "marineThree");
        }
      }

      // 게임 시작
      if (socketData.message === "ALL_RENDERED_COMPLETED") {
        gameStart();
      }

      if (socketData.message === "ORDER 뭐시기 해적턴입니다!!!") {
        ("해적 시작위치 고르는 액션 함수");
      }
    }
  }, [socketData]);

  return (
    <>
      {loading && <Loading />}
      <Round topLeft={[60, 1]} />
      <Turn topLeft={[360, 1]} currentTurn={1} />
      <Canvas
        camera={{
          position: [0, 800, 500],
          far: 10000,
          fov: 50,
        }}
        onCreated={() => {
          setLoading(false);
          send("/pub/room", {
            message: "RENDERED_COMPLETE",
            sender: nickname,
            gameId,
          });
        }}
      >
        <Tween />
        <CameraControls ref={cameraControlRef} />
        <directionalLight position={[1, 1, 1]} />
        <ambientLight intensity={2} />
        {/* <OrbitControls target={[0, 1, 0]} /> */}
        <axesHelper scale={10} />
        <IngameThree
          nextMoveableNodes={nextMoveableNodes}
          nextNodeEdge={nextNodeEdge}
        />
      </Canvas>
      <EventHandler
        newMoveableNodes={newMoveableNodes}
        setNextMoveableNodes={setNextMoveableNodes}
        newNodeEdge={newNodeEdge}
        setNextNodeEdge={setNextNodeEdge}
      />
    </>
  );
}

function IngameThree({ nextMoveableNodes, nextNodeEdge }: any) {
  // 여기서 좀 빵빵해질듯...? 소켓 코드랑...
  const renderedEdges = new Set();

  return (
    <>
      {/* Nodes */}
      {DUMMY_DATA.nodeList.map(node => {
        if (
          (node.nodeId >= 1 && node.nodeId <= 189) ||
          (node.nodeId >= 200 && node.nodeId <= 373)
        ) {
          return (
            <Node
              key={node.nodeId}
              node={node}
              isNextMoveableNode={
                nextMoveableNodes?.includes(node.nodeId) ? true : false
              }
            />
          );
        }
      })}

      {/* Edges */}
      {DUMMY_DATA.edgeList.slice(199).map((edges, index) => {
        return edges.map(edge => {
          // 중복 간선 방지
          const edgeKey = `${index + 200}-${edge}`;
          const reEdgeKey = `${edge}-${index + 200}`;
          if (renderedEdges.has(edgeKey) || renderedEdges.has(reEdgeKey)) {
            return null;
          }
          renderedEdges.add(edgeKey);
          return (
            <Edge
              key={edgeKey}
              position={[
                DUMMY_DATA.nodeArr[edge],
                DUMMY_DATA.nodeArr[index + 200],
              ]}
              isNextNodeEdge={nextNodeEdge.some(
                ([start, end]: number[]) =>
                  (start === index + 200 && end === edge) ||
                  (start === edge && end === index + 200),
              )}
            />
          );
        });
      })}

      {/* Pieces */}
      <Piece position={DUMMY_DATA.nodeArr[107]} />
      <Map />
    </>
  );
}

function EventHandler({
  newMoveableNodes,
  setNextMoveableNodes,
  newNodeEdge,
  setNextNodeEdge,
}: any) {
  const { movePirate } = usePiece();
  const { pieceCamera, mapCamera } = useCamera();
  const [isNextMoveableNodes, setIsNextMoveableNodes] = useState(true);
  const [isNewNodeEdge, setIsNewNodeEdge] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isMoved, setIsMoved] = useState(false);

  // 이동 가능 노드 표시
  const handleNextMoveableNodes = () => {
    setIsNextMoveableNodes(!isNextMoveableNodes);
    setNextMoveableNodes(isNextMoveableNodes ? newMoveableNodes : []);
  };

  // 다음 노드 경로 표시
  const handleNextNodeEdge = () => {
    setIsNewNodeEdge(!isNewNodeEdge);
    setNextNodeEdge(isNewNodeEdge ? newNodeEdge : []);
  };

  // 말 포커싱
  const handleFocusPiece = () => {
    if (!isFocused) {
      pieceCamera(DUMMY_DATA.nodeArr[107]);
      setIsFocused(true);
    } else {
      mapCamera();
      setIsFocused(false);
    }
  };

  // 말 이동
  const handleMovePiece = () => {
    setIsMoved(!isMoved);
    movePirate(isMoved ? DUMMY_DATA.nodeArr[107] : [-30, 100]);
  };

  return (
    <div className={style.box}>
      <button className={style.greenbutton} onClick={handleNextMoveableNodes}>
        {isNextMoveableNodes ? "이동 가능 노드 표시" : "이동 가능 노드 미표시"}
      </button>
      <button className={style.greenbutton} onClick={handleNextNodeEdge}>
        {isNewNodeEdge ? "다음 경로 표시" : "다음 경로 미표시"}
      </button>
      <button className={style.greenbutton} onClick={handleFocusPiece}>
        {isFocused ? "전체 포커싱" : "말 포커싱"}
      </button>
      <button className={style.greenbutton} onClick={handleMovePiece}>
        말 이동
      </button>
    </div>
  );
}
