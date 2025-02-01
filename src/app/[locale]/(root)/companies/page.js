"use client";

import CompaniesTable from "./CompaniesTable";

export default function Companies() {
  return (
    <div className="row" style={{ height: "100%" }}>
      <CompaniesTable moduleType="account"/>
    </div>
  );
}
