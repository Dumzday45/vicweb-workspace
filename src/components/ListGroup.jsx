import { MouseEvent } from "react";

function ListGroup() {
  let items = [
    "New York",
    "San Francisco",
    "Los Angeles",
    "Tokyo",
    "London",
    "Paris",
  ];
  let selectedIndex = 0;

  const handleClick = (event) => console.log(event);

  return (
    <>
      <h1>List</h1>
      {items.length === 0 && <p>No items found</p>}
      <ul className="list-group">
        {items.map((items, index) => (
          <li
            className={
              selectedIndex === index
                ? "list-group-ite active"
                : "list-group-item"
            }
            key={items}
            onClick={handleClick}
          >
            {items}
          </li>
        ))}
      </ul>
    </>
  );
}

export default ListGroup;
