const NamePage = ({ params }: { params: { name: string } }) => {
  const { name } = params;

  const name_change = decodeURI(name);

  return (
    <div>
      <h1>Welcome, {name_change}</h1>
      {/* Add more content here as needed */}
    </div>
  );
};

export default NamePage;
