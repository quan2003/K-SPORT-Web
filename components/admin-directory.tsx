import { adminEventsDemo, adminUsersDemo } from "@/lib/mock-data";

type DirectoryKind = "events" | "users";

export function AdminDirectory({ kind }: { kind: DirectoryKind }) {
  const isEvents = kind === "events";
  const heading = isEvents ? "Giải đấu" : "Người dùng";
  const description = isEvents ? "Theo dõi trạng thái và số đăng ký của các giải đã được nhập thử." : "Theo dõi quyền truy cập và lần hoạt động gần nhất của các tài khoản mẫu.";
  const header = <div className="admin-directory-header"><div><h2>{isEvents ? "Danh sách giải đấu" : "Danh sách người dùng"}</h2><p>{isEvents ? adminEventsDemo.length : adminUsersDemo.length} bản ghi minh họa · chưa kết nối hệ thống quản trị.</p></div><button className="button red" type="button" disabled>{isEvents ? "Tạo giải đấu" : "Mời người dùng"}</button></div>;
  return <section className="admin-directory" aria-labelledby="admin-directory-heading">
    <div className="admin-title"><p className="admin-context">Dữ liệu minh họa</p><h1 id="admin-directory-heading">{heading}</h1><p>{description}</p></div>
    {header}
    <div className="admin-demo-notice" role="note">Các số liệu và tên bên dưới chỉ để minh họa giao diện. Chức năng tạo, sửa và phân quyền sẽ hoạt động khi Admin API được tích hợp.</div>
    {isEvents ? <div className="admin-table-wrap"><table className="admin-directory-table"><thead><tr><th scope="col">Giải đấu</th><th scope="col">Thời gian · địa điểm</th><th scope="col" className="num">Đăng ký</th><th scope="col">Trạng thái</th></tr></thead><tbody>{adminEventsDemo.map((row) => <tr key={row.id}><td><strong>{row.name}</strong></td><td><span>{row.date}</span><small>{row.location}</small></td><td className="num">{row.registrations}</td><td><span className={`admin-status ${row.status === "Mở đăng ký" ? "is-live" : "is-draft"}`}>{row.status}</span></td></tr>)}</tbody></table></div> : <div className="admin-table-wrap"><table className="admin-directory-table"><thead><tr><th scope="col">Tài khoản</th><th scope="col">Vai trò</th><th scope="col">Hoạt động gần nhất</th><th scope="col">Trạng thái</th></tr></thead><tbody>{adminUsersDemo.map((row) => <tr key={row.id}><td><strong>{row.name}</strong></td><td>{row.role}</td><td>{row.lastActive}</td><td><span className={`admin-status ${row.status === "Hoạt động" ? "is-live" : "is-draft"}`}>{row.status}</span></td></tr>)}</tbody></table></div>}
  </section>;
}
