import { useState, useEffect } from "react";

const Div = (props: any) => {
    return <div {...props} />;
};

const Span = (props: any) => {
  return <span {...props} />;
};

const Img = (props: any) => {
    return <img {...props} />;
};

const Input = (props: any) => {
  return <input {...props} />;
};

// A custom hook that returns true if the window width is less than the breakpoint
const useIsMobile = (breakpoint: number) => {
  // Define the initial value based on the window width
  const initialIsMobile = window.innerWidth <= breakpoint;

  // Define the state for the mobile mode
  const [isMobile, setIsMobile] = useState(initialIsMobile);

  // Define a function to handle resize event
  const handleResize = () => {
    if (window.innerWidth <= breakpoint) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  // Add event listener for resize
  useEffect(() => {
    window.addEventListener("resize", handleResize);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Return the state value
  return isMobile;
};


export { Div, Span, Img, Input, useIsMobile }