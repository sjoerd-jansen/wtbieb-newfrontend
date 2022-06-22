function GenerateBooks()
{
	fetch(backendurl + "/book/generate").then(response => {
        return response.json();
    }).then( response => {
        GenerateResult(response, "GenerateBooks()");
    })
}

function GenerateEmployee()
{
	fetch(backendurl + "/employee/generate").then(response => {
        return response.json();
    }).then( response => {
        GenerateResult(response, "GenerateEmployee()");
    })
}

function GenerateHistory()
{
	fetch(backendurl + "/history/generate").then(response => {
        return response.json();
    }).then( response => {
        GenerateResult(response, "GenerateHistory()");
    })
}

function GenerateReservations()
{
	fetch(backendurl + "/reserve/generate").then(response => {
        return response.json();
    }).then( response => {
        GenerateResult(response, "GenerateReservations()");
    })
}

function GenerateRatings()
{
	fetch(backendurl + "/rating/generate").then(response => {
        return response.json();
    }).then( response => {
        GenerateResult(response, "GenerateRatings()");
    })
}

function GenerateResult(result, method)
{
	if (result.length > 0)
	{
		console.log(method + " succeeded!");
		console.log(result);
	}
	else
	{
		console.log(method + " failed...");		
	}
}