import React from "react";

const Pane = React.forwardRef((props, ref) => {
  const { children, className, split, style: styleProps, size } = props;

  const classes = ["Pane", split, className];

  const style = Object.assign(
    {}, 
    styleProps || {}, 
    {
      position: "relative",
      outline: "none"
    }
  );

  if (size !== undefined) {
    if (split === "vertical") {
      style.width = size;
    } else {
      style.height = size;
      style.display = "flex";
    }
  }

  return (
    <div ref={ref} className={classes.join(" ")} style={style}>
      {children}
    </div>
  );
}) 

export default Pane