import React from "react";
import { Outlet } from "react-router-dom";

export default function Main() {
  console.log("Main rendered");

  return (
    <>
      <div className="container-contact100">
        <div
          className="contact100-map"
          id="google_map"
          data-map-x="40.722047"
          data-map-y="-73.986422"
          data-pin="images/icons/map-marker.png"
          data-scrollwhell="0"
          data-draggable="1"
        ></div>

        <div className="wrap-contact100">
          <div
            className="contact100-form-title"
            style={{ backgroundImage: "url(/images/bg-01.jpg)" }}
          >
            <span className="contact100-form-title-1"> Yearbook 2023 </span>

            <span className="contact100-form-title-2"> Literary Circle </span>
          </div>

          <Outlet />
        </div>
      </div>
    </>
  );
}
