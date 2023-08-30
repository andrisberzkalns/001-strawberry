fetch('https://www.themealdb.com/api/json/v1/1/filter.php?i=strawberries')
    .then(response => response.json())
    .then(data => {
        // Process the data
        console.log(data);
        document.querySelector("#recipies").innerHTML = data.meals.map(meal => `
        <div class="max-w-sm rounded overflow-hidden shadow-lg bg-white mx-auto">
            <img class="w-full" src="${meal.strMealThumb}" alt="Sunset in the mountains">
            <div class="px-6 py-4">
                <div class="font-bold text-xl mb-2">${meal.strMeal}</div>
            </div>
        </div>
        `).join('');

        // Tailwind cards
        


    })
    .catch(error => {
        // Handle errors
        console.error(error);
    });