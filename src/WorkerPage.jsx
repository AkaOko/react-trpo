import React from "react";
import Navbar from "./components/Navbar";
import MaterialsManagement from "./components/MaterialsManagement";
import MaterialRequestsManagement from "./components/MaterialRequestsManagement";
import WorkerOrdersManagement from "./components/WorkerOrdersManagement";

const WorkerPage = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Панель мастера ювелира
        </h1>

        <div className="mb-8">
          <MaterialsManagement />
        </div>

        <div className="mb-8">
          <MaterialRequestsManagement />
        </div>

        <div className="mt-8">
          <WorkerOrdersManagement />
        </div>
      </div>
    </>
  );
};

export default WorkerPage;
