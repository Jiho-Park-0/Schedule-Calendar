import { Button } from "antd";

interface HeaderProps {
  profileName: string;
  onTeacherActionClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  profileName,
  onTeacherActionClick,
}) => {
  return (
    <header className="bg-white shadow rounded-lg p-4 md:p-6 mb-4 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-lg md:text-2xl lg:text-3xl font-bold">
          {decodeURI(profileName)} 선생님의 시간표
        </h1>
      </div>
      <Button onClick={onTeacherActionClick}>관리자 페이지</Button>
    </header>
  );
};

export default Header;
