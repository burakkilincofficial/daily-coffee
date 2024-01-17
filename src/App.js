import "./styles.css";
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const initialEmployees = JSON.parse(localStorage.getItem("employees")) || 
  [{ "id": 5, "name": "Akin", "totalCoffeMoney": 0, "canTakeCoffee": true }, 
  { "id": 1, "name": "Atakan", "totalCoffeMoney": 20, "canTakeCoffee": true, "lastCoffeeDate": "Tue Jan 16 2024" }, 
  { "id": 9, "name": "Batikan", "totalCoffeMoney": 80, "canTakeCoffee": true, "lastCoffeeDate": "Tue Jan 16 2024" }, 
  { "id": 13, "name": "Burak A.", "totalCoffeMoney": 40, "canTakeCoffee": true, "lastCoffeeDate": "Wed Jan 17 2024" }, 
  { "id": 3, "name": "Burak K.", "totalCoffeMoney": 0, "canTakeCoffee": true }, 
  { "id": 8, "name": "Ebubekir", "totalCoffeMoney": 20, "canTakeCoffee": true, "lastCoffeeDate": "Wed Jan 17 2024" }, 
  { "id": 12, "name": "Egehan", "totalCoffeMoney": 60, "canTakeCoffee": true }, 
  { "id": 2, "name": "Emrah", "totalCoffeMoney": 120, "canTakeCoffee": true }, 
  { "id": 10, "name": "Hayat", "totalCoffeMoney": 40, "canTakeCoffee": true, "lastCoffeeDate": "Wed Jan 17 2024" }, 
  { "id": 4, "name": "Irem", "totalCoffeMoney": 60, "canTakeCoffee": true }, 
  { "id": 7, "name": "Nazli", "totalCoffeMoney": 40, "canTakeCoffee": true, "lastCoffeeDate": "Wed Jan 17 2024" }, 
  { "id": 6, "name": "Nilgun", "totalCoffeMoney": 0, "canTakeCoffee": true }, 
  { "id": 11, "name": "Omer", "totalCoffeMoney": 0, "canTakeCoffee": true }];

  initialEmployees.sort((a, b) => a.name.localeCompare(b.name));

  const [employees, setEmployees] = useState(initialEmployees);
  const [totalMoney, setTotalMoney] = useState(0);

  useEffect(() => {
    // Toplam kahve parasını hesapla
    const total = employees.reduce((acc, employee) => acc + employee.totalCoffeMoney, 0);
    setTotalMoney(total);
  }, [employees]);

  const handleCoffeeClick = (id) => {
    const today = new Date().toDateString();
    const employeeIndex = employees.findIndex((employee) => employee.id === id);
    const selectedEmployee = employees[employeeIndex];

    if (selectedEmployee.lastCoffeeDate === today) {
      alert(`${selectedEmployee.name}, bugün zaten kahve cezani aldın! ☕`);
      return;
    }

    const updatedEmployees = [...employees];
    updatedEmployees[employeeIndex] = {
      ...selectedEmployee,
      totalCoffeMoney: selectedEmployee.totalCoffeMoney + 20,
      lastCoffeeDate: today,
    };

    setEmployees(updatedEmployees);
    localStorage.setItem("employees", JSON.stringify(updatedEmployees));
  };

  return (
    <div className="App">
      <h1>Daily Coffee Cash</h1>
      <h4>total coffee cash: {totalMoney} TL</h4>
      <div className="employee-list">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className={`employee-card ${employee.totalCoffeMoney !== 0 ? 'one-coffee' : ''}`}
          >
            <h3>{employee.name}</h3>
            <p>{employee.totalCoffeMoney} TL</p>
            <button onClick={() => handleCoffeeClick(employee.id)}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Coffee_cup_icon.svg/2137px-Coffee_cup_icon.svg.png"
                alt="Kahve"
                width="50"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
