function OnPageOpen()
{
	//, this, 'grey'
	let pageToOpen = localStorage.getItem("CurrentPage");

	if (pageToOpen != null)
	{
		openPage(pageToOpen, this, 'grey');
	}
}

function FetchCurrentUser()
{
	let id = localStorage.getItem("id");
	fetch(backendurl + "/employee/" + id).then(response => {
        return response.json();
    }).then( employee => {
		SetEmployeeInfo(employee);
    })
}

function SetEmployeeInfo(user)
{
	window.localStorage.setItem("userInfo", JSON.stringify(user));
	document.getElementById("userName").innerHTML = user.employeeName;
	document.getElementById("userEmail").innerHTML = user.employeeEmail;
	document.getElementById("userAvatar").src = user.employeeAvatar;
}

FetchCurrentUser();

OnPageOpen();



/*

	THIS CODE IS TO UPDATE THE
	USER INFORMATION AND SEND IT
	TO THE DATABASE

*/
function UpdateUser()
{
	user = JSON.parse(window.localStorage.getItem("userInfo"));

	let userEmail = document.getElementById("emailUpdate").value;
	let userPassword = document.getElementById("passwordUpdate").value;
	let userAvatar = document.getElementById("avatarUpdate").value;
	let currentPassword = document.getElementById("currentPassword").value;

	let updateEmployee = {
		employeeId: user.employeeId,
		employeeName: user.employeeName,
		employeeEmail: userEmail,
		employeePassword: userPassword,
		employeeAvatar: userAvatar
	}

	if (currentPassword === "")
		alert("Vul je huidige wachtwoord in om je profiel te updaten");
	else if (userPassword.length < 6 && userPassword != "")
		alert("Het nieuwe wachtwoord moet uit minstens 6 tekens bestaan.")
	else
		CheckCurrentPassword(user.employeeEmail, currentPassword, updateEmployee)
}

function CheckCurrentPassword(email, password, updateEmployee)
{
	fetch(backendurl + "/employee/login/" + email + "/" + password).then(response => {
			return response.json();
		}).then( login => {
			SubmitUpdateUser(updateEmployee)
		});
}

async function SubmitUpdateUser(updateEmployee)
{
	if (updateEmployee.employeeId != null)
    {
        let response = await fetch(backendurl + "/employee/" + updateEmployee.employeeId + "/update", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateEmployee)
        })
        .catch(error => {
            alert('Er is iets fouts gegaan');
        });

		let str = await response.json();
		alert(str.response);
		FetchCurrentUser();
    }
}