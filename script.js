
const supabaseUrl = 'https://gnhiwqpgpeoolmkkzrwo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduaGl3cXBncGVvb2xta2t6cndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mzg4MTgsImV4cCI6MjA4NzExNDgxOH0.xYoMidYCqTVYbrOWCtzP24fnUQuDMy4G-juWhjWmwfQ';



const client = window.supabase.createClient(supabaseUrl, supabaseKey);

async function loadCars() {
    const { data, error } = await client
        .from('cars')
       .select(`
    car_id,
    model,
    price,
    manufacturers!cars_manufacturer_id_fkey ( manufacturer_name )
`)

    if (error) {
        console.error('Error fetching cars:', error);
        return;
    }

    console.log('Cars data:', data);

    const tableBody = document.getElementById('cars-body');
    tableBody.innerHTML = '';

    data.forEach(car => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${car.car_id}</td>
            <td>${car.model}</td>
            <td>${car.price}</td>
            <td>${car.manufacturers?.manufacturer_name || 'N/A'}</td>
            <td>
                <button onclick="updateCar(${car.car_id})">Update</button>
                <button onclick="deleteCar(${car.car_id})">Delete</button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

async function deleteCar(id) {
    const { error } = await client
        .from('cars')
        .delete()
        .eq('car_id', id);

    if (error) {
        console.error('Delete error:', error);
    } else {
        loadCars();
    }
}

async function updateCar(id) {
    const newPrice = prompt('Enter new price:');

    if (!newPrice) return;

    const { error } = await client
        .from('cars')
        .update({ price: parseInt(newPrice) })
        .eq('car_id', id);

    if (error) {
        console.error('Update error:', error);
    } else {
        loadCars();
    }
}

async function addCar() {

    const manufacturer = document.getElementById('manufacturer-select').value;
    const model = document.getElementById('car-model').value;
    const price = document.getElementById('car-price').value;
    const year = document.getElementById('car-year').value;
    const color = document.getElementById('car-color').value;

    if (!manufacturer || !model || !price || !year || !color) {
        alert('Please fill in all fields');
        return;
    }


    const { data: manufacturerData, error: manufacturerError } = await client
        .from('manufacturers')
        .select('manufacturer_id')
        .eq('manufacturer_name', manufacturer)
        .single();

    if (manufacturerError) {
        console.error('Manufacturer fetch error:', manufacturerError);
        alert('Error finding manufacturer');
        return;
    }

    const manufacturer_id = manufacturerData.manufacturer_id;


  const { data, error } = await client
    .from('cars')
    .insert([{
        model: model,
        price: parseInt(price),
        year: parseInt(year),
        manufacturer_id: manufacturer_id
    }])
    .select();

if (error) {
    console.error("FULL ERROR:", error);
    alert('Failed to add car: ' + error.message);
} else {
    console.log("Inserted:", data);
    alert('Car added successfully!');
}
    
        document.getElementById('preview-text').innerText =
            `${manufacturer} ${model} (€${price})`;

    
        document.getElementById('car-form').reset();

         window.location.href = "cars.html";
    }


window.onload = loadCars;
