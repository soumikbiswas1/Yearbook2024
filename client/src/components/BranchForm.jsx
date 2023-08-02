import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BranchData } from "./constants/BranchData";

const BranchForm = (props) => {
  const branchs = Object.keys(BranchData);
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    branch: branchs[0],
  });

  const onSubmitBranchForm = (e) => {
    e.preventDefault();
    console.log(e, formValues.branch);
    return navigate(`/${formValues.branch}`);
  };

  const renderOptions = () => {
    return branchs.map((branch) => {
      return <option value={branch}>{BranchData[branch].name}</option>;
    });
  };

  const onFormValueChange = (e) => {
    // console.log(e.target.value);
    setFormValues({ branch: e.target.value });
  };

  return (
    <form
      className="contact100-form"
      name="regform"
      onSubmit={onSubmitBranchForm}
    >
      <div className="wrap-input100">
        <span className="label-input100">Department</span>
        <select
          className="input100"
          name="dept"
          value={formValues.branch}
          onChange={onFormValueChange}
        >
          {renderOptions()}
        </select>
        <span className="focus-input100"></span>
      </div>

      <div
        className="container-contact100-form-btn d-grid"
        style={{ marginTop: "5px" }}
      >
        <button className="btn-block contact100-form-btn">
          <span>
            Submit
            <i className="fa fa-long-arrow-right m-l-7" aria-hidden="true"></i>
          </span>
        </button>
      </div>
    </form>
  );
};

BranchForm.propTypes = {};

export default BranchForm;
