class Employee{
    constructor(data){
        this.id = data['id'];
        this.email = data['email'];
        this.name = data['name'];
        this.departmentId = data['departmentId'];
        this.imageUrl = data['imageUrl'];
    }
}

module.exports = Employee;
