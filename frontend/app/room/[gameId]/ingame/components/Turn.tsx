import styles from "./Turn.module.scss";

import * as React from "react";
import clsx from "clsx";

interface TurnProps extends React.HTMLAttributes<HTMLDivElement> {
  currentTurn: number;
  topLeft?: [number, number];
}

export default function Turn({
  currentTurn,
  className,
  topLeft,
  ...props
}: TurnProps) {
  const [top, left] = topLeft || [0, 0];

  return (
    <div
      {...props}
      className={clsx(styles.container, "banselect", className)}
      style={{
        top,
        left,
      }}
    >
      <div className="bg-yellow-900 border-amber-950">
        <span className="text-yellow-300">{currentTurn}턴</span>{" "}
        <span className="text-white">/ 15턴</span>
      </div>
    </div>
  );
}
