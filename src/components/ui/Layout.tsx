import classNames from "classnames";
import React from "react";

type Props = React.HTMLProps<HTMLDivElement>;

export const Layout: React.FC<Props> = ({ className, children, ...props }) => {
  return (
    <div
      className={classNames(className, {
        "w-full h-full flex flex-col overflow-scroll": true,
      })}
      {...props}
    >
      <div className="container mx-auto h-full flex flex-col items-center px-2 mb-10">{children}</div>
    </div>
  );
};
