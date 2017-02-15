class Department{
    constructor(data){
        this.name = data['name'];
        this.id = data['id'];
        this.employees = data['employees'] || []
    }
    
    addEmployee(employee){
        this.employees.push(employee);
    }

    findEmployeeById(id){
        return this.employees.find(dept => dept.id === parseInt(id));
    }

    updateEmployee(updatedEmployee){
        this.employees = this.employees.map(emp => {
            return emp.id != updatedEmployee.id ? emp : updatedEmployee })
    }
    
    deleteEmployeeById(id){
        this.employees = this.employees.filter(emp => { return emp.id != id });
    }
}

module.exports = Department;
