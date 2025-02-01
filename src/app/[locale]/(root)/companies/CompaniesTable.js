import TableComponent from "@/common/moduleCommon/TableComponent";
export default function CompaniesTable({moduleType}) {
  return (
    <div className="card-body p-0 px-2">
      <TableComponent moduleType={moduleType} />
    </div>
  );
}
