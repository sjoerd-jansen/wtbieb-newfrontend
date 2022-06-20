function LogIn() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

	fetch(backendurl + "/employee/login/" + email + "/" + password).then(response => {
			return response.json();
		}).then( login => {
			CheckUser(login);
		});
}

function CheckUser(user)
{
	console.log(user);
	if (user.employeeName != null)
	{
		localStorage.setItem("id", user.employeeId);
		localStorage.setItem("userName", user.employeeName);
		localStorage.setItem("userAdmin", user.employeeAdmin);

		if (user.employeeAdmin)
			window.location.href = "./adminPage.html";
		else
			window.location.href = "./userPage.html";
	}
	else
	{
		alert("Gebruikersnaam of wachtwoord incorrect. Probeer opnieuw of neem contact op met support.")
	}
}


function togglePasswordVisibility()
{
	var x = document.getElementById("password");

	if (x.type === "password")
		x.type = "text";
	else
		x.type = "password";
}