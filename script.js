const supabaseUrl = 'https://gnhiwqpgpeoolmkkzrwo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduaGl3cXBncGVvb2xta2t6cndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mzg4MTgsImV4cCI6MjA4NzExNDgxOH0.xYoMidYCqTVYbrOWCtzP24fnUQuDMy4G-juWhjWmwfQ';

const client = window.supabase.createClient(supabaseUrl, supabaseKey);

// ===================== CARS =====================

async function loadCars() {
    const { data, error } = await client
        .from('cars')
        .select(`
            car_id,
            model,
            price,
            manufacturers!cars_manufacturer_id_fkey ( manufacturer_name )
        `);

    if (error) {
        console.error('Error fetching cars:', error);
        return;
    }

    const tableBody = document.getElementById('cars-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!data || data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5">No cars found</td></tr>`;
        return;
    }

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
        alert('Failed to delete car');
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
        alert('Failed to update car');
    } else {
        loadCars();
    }
}
let allManufacturers = [];

function renderManufacturers(data) {
  const body = document.getElementById('manufacturers-body');
  if (!body) return;

  body.innerHTML = '';

  if (!data || data.length === 0) {
    body.innerHTML = `<tr><td colspan="3">No manufacturers found</td></tr>`;
    return;
  }

  data.forEach(m => {
    const safeName = String(m.manufacturer_name).replace(/'/g, "\\'");
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${m.manufacturer_id}</td>
      <td>${m.manufacturer_name}</td>
      <td>
        <button onclick="editManufacturer(${m.manufacturer_id}, '${safeName}')">Edit</button>
        <button onclick="deleteManufacturer(${m.manufacturer_id})">Delete</button>
      </td>
    `;

    body.appendChild(row);
  });
}

function filterManufacturers() {
  const searchInput = document.getElementById('search-manufacturer');
  if (!searchInput) return;

  const searchValue = searchInput.value.toLowerCase().trim();

  const filtered = allManufacturers.filter(m =>
    m.manufacturer_name.toLowerCase().includes(searchValue)
  );

  renderManufacturers(filtered);
}
async function loadManufacturers() {
  const { data, error } = await client
    .from('manufacturers')
    .select('*')
    .order('manufacturer_id', { ascending: true });

  const body = document.getElementById('manufacturers-body');
  if (!body) return;

  body.innerHTML = '';

  if (error) {
    console.error(error);
    body.innerHTML = `<tr><td colspan="3">Error loading manufacturers</td></tr>`;
    return;
  }

  allManufacturers = data || [];
  renderManufacturers(allManufacturers);
}

async function addManufacturer() {
    const input = document.getElementById('manufacturer-name');
    if (!input) return;

    const name = input.value.trim();

    if (!name) {
        alert('Enter manufacturer name');
        return;
    }

    const { error } = await client
        .from('manufacturers')
        .insert([{ manufacturer_name: name }]);

    if (error) {
        console.error('Insert error:', error);
        alert('Failed to add manufacturer');
        return;
    }

    input.value = '';
    loadManufacturers();
}

async function editManufacturer(id, currentName) {
    const newName = prompt('Enter new manufacturer name:', currentName);

    if (!newName || !newName.trim()) return;

    const { error } = await client
        .from('manufacturers')
        .update({ manufacturer_name: newName.trim() })
        .eq('manufacturer_id', id);

    if (error) {
        console.error('Update error:', error);
        alert('Failed to update manufacturer');
    } else {
        loadManufacturers();
    }
}

async function deleteManufacturer(id) {
    const confirmed = confirm('Are you sure you want to delete this manufacturer?');
    if (!confirmed) return;

    const { error } = await client
        .from('manufacturers')
        .delete()
        .eq('manufacturer_id', id);

    if (error) {
        console.error('Delete error:', error);
        alert('Cannot delete this manufacturer. It may be linked to cars.');
    } else {
        loadManufacturers();
    }
}// ===================== PAGE LOAD CONTROL =====================

window.onload = () => {
    if (document.getElementById('cars-body')) {
        loadCars();
    }

    if (document.getElementById('manufacturers-body')) {
        loadManufacturers();
    }
};