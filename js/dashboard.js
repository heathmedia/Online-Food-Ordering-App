// Initialize constants
const mealUrl = 'https://www.themealdb.com/api/json/v1/1/search.php?s='
const mealFilterUrl = 'https://www.themealdb.com/api/json/v1/1/filter.php?c='
const email = localStorage.getItem('email')

const categories = [
    {id:'All', icon:''},
    {id:'Chicken', icon:'🍗'},
    {id:'Seafood', icon:'🦐'},
    {id:'Beef', icon:'🥩'},
    {id:'Pork', icon:'🥓'},
    {id:'Vegan', icon:'🥗'},
    {id:'Vegetarian', icon:'🥦'},
    {id:'Goat', icon:'🐐'},
    {id:'Lamb', icon:'🐑'},
    {id:'Pasta', icon:'🍝'},
    {id:'Dessert', icon:'🍰'},
    {id:'Breakfast', icon:'🍳'}
]

// Check if user is logged in and direct to Login page if not
if (localStorage.getItem('isLoggedIn') !== 'true') {
    logout()
}

// Initialize event listeners for showing/hiding Cart
document.getElementById('cartBtn').addEventListener('click', openCart)
document.getElementById('closeCartBtn').addEventListener('click', closeCart)
overlay.addEventListener('click', closeCart)

// Add email to Welcome message
if (email) {
    document.getElementById('h1Header').textContent = `Welcome back, ${email}!`
}

// Re-populate the Cart if items are available from prior session.
// If cart is null, disable Checkout button.
if(localStorage.getItem('cart')) {
    const cart = JSON.parse(localStorage.getItem('cart'))
    populateCartDisplay(cart)
} else {
    setButtonState(document.getElementById('checkoutBtn'), false)
}

// Get available meals from Meal API & setup meal filtering categories
getMeals()
setupCategories()

function logout() {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('email')
    window.location.href = 'login.html'
}

function addMealToDisplay(item) {

    let meal = document.createElement('div')
    meal.className = 'meal'
    meal.id = item.idMeal

    let img = document.createElement('img')
    img.src = item.strMealThumb
    img.alt = item.strMeal
    img.className = "sm:w-64 rounded-lg mb-2"
    
    let info = document.createElement('div')
    info.className = 'grid w-40'
    
    let title = document.createElement('div')
    title.textContent = item.strMeal
    title.className = 'text-lg font-medium truncate w-full'

    // Modify the meal ID to create a price for the meal that can be reliably reproduced
    // Maintain the price as an integer value (in pennies) to prevent floating point errors.
    let priceValue = Number(item.idMeal) - 50000
    let price = document.createElement('div')
    price.textContent = `$${(priceValue/100).toFixed(2)}` // Display interger price in two-digit decimal format.

    info.append(title, price)
    
    let addBtn = document.createElement('button')
    addBtn.innerHTML = '<span><i class="fa-solid fa-plus"></i> Add</span>'
    addBtn.className = 'cursor-pointer shrink-0 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full'
    addBtn.onclick = () => addToCart({id: item.idMeal, name: item.strMeal, price: priceValue, image: item.strMealThumb})

    let controls = document.createElement('div')
    controls.className = 'flex items-center justify-between'
    controls.append(info, addBtn)
    
    meal.append(img, controls)
    document.getElementById('mealList').appendChild(meal)
}

function addToCart(item) {
    const cart = getCart()

    // Check if the item already exists in the cart.
    const cartItem = cart.find(i => i.id === item.id)
    if (cartItem) {
        cartItem.quantity += 1
    } else {
        cart.push({...item, quantity: 1})
    }

    saveCart(cart)
    populateCartDisplay(cart)
}

function removeFromCart(item) {
    let cart = getCart()
    const cartItem = cart.find(i => i.id === item.id)

    if (cartItem && cartItem.quantity === 1) {
        cart = cart.filter(i => i.id !== item.id)
    } else {
        cart = cart.map(i => 
            i.id === item.id ? {...i, quantity: i.quantity - 1} : i)
    }

    saveCart(cart)
    populateCartDisplay(cart)
}

// Set a button as enabled or disabled.
function setButtonState(btn, enabled) {
    btn.disabled = !enabled
    btn.classList.toggle('opacity-50', !enabled)
    btn.classList.toggle('cursor-not-allowed', !enabled)
    btn.classList.toggle('cursor-pointer', enabled)
}

function populateCartDisplay(cart) {
    
    const cartList = document.getElementById('cartList')

    // Update totals for cart quanity and cart cost.
    const totals = cart.reduce((acc, i) => {
            acc.quantity += i.quantity
            acc.cost += i.quantity * i.price
            return acc
        }, {quantity: 0, cost: 0}
    )

    // Show total number of items in cart in the Header and Cart panel.
    document.getElementById('itemCountInHeader').textContent = `${totals.quantity}`
    document.getElementById('itemCountInCart').textContent = `(${totals.quantity})`
    
    // Convert the the cart cost total from integer to two-digit decimal for display.
    document.getElementById('cartTotal').textContent = `$${(totals.cost/100).toFixed(2)}`
    
    // If Cart is empty, display Empty Cart message and disable Checkout button.
    // Else, display cart items and enable Checkout button.
    if (totals.quantity === 0) {
        document.getElementById('cartEmpty').classList.remove('hidden')
        setButtonState(document.getElementById('checkoutBtn'), false)

    } else {
        document.getElementById('cartEmpty').classList.add('hidden')
        setButtonState(document.getElementById('checkoutBtn'), true)
    }

    // Populate Cart list with items in cart.
    cartList.innerHTML = ''
    cart.forEach(item => {
        const itemDisplay = document.createElement('div')
        itemDisplay.className = 'grid grid-cols-3 justify-items-center items-center w-full mb-2'
        
        const image = document.createElement('img')
        image.src = item.image
        image.className = 'rounded-lg h-16'

        const name = document.createElement('div')
        name.textContent = item.name

        const qtyControls = document.createElement('div')
        qtyControls.className = 'grid grid-cols-3 items-center justify-between'
        
        const quantity = document.createElement('div')
        quantity.textContent = item.quantity
        quantity.className = 'text-center'

        const decreaseBtn = document.createElement('button')
        const increaseBtn = document.createElement('button')

        decreaseBtn.innerHTML = '<i class="fa-solid fa-minus"></i>'
        decreaseBtn.className = 'cursor-pointer rounded-full border-1 w-7 h-7'
        decreaseBtn.onclick = () => removeFromCart(item)

        increaseBtn.innerHTML = '<i class="fa-solid fa-plus"></i>'
        increaseBtn.className = 'cursor-pointer rounded-full border-1 w-7 h-7'
        increaseBtn.onclick = () => addToCart(item)

        qtyControls.append(decreaseBtn, quantity,increaseBtn)

        itemDisplay.append(image, name, qtyControls)
        cartList.append(itemDisplay)
    })
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart))
}

function getCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || []
    return cart
}

// Open the right side Cart panel.
function openCart() {
    cartPanel.classList.remove('translate-x-full')
    overlay.classList.remove('opacity-0', 'pointer-events-none')
    overlay.classList.add('opacity-100')
}

// Close the right side Cart panel.
function closeCart() {
    cartPanel.classList.add('translate-x-full')
    overlay.classList.add('opacity-0', 'pointer-events-none')
    overlay.classList.remove('opacity-100')
    
    document.getElementById('orderComplete').classList.add('hidden')
    document.getElementById('continueShoppingBtn').classList.add('hidden')
    document.getElementById('checkoutBtn').classList.remove('hidden')

    if(getCart().length === 0) document.getElementById('cartEmpty').classList.remove('hidden')
}

function checkout() {
    saveCart([])
    populateCartDisplay([])
    document.getElementById('checkoutBtn').classList.add('hidden')
    document.getElementById('cartEmpty').classList.add('hidden')
    document.getElementById('orderComplete').classList.remove('hidden')
    document.getElementById('continueShoppingBtn').classList.remove('hidden')
}

function updateMealDisplay(meals) {
    document.getElementById('mealList').innerHTML = ''
    if(meals !== null) {
        document.getElementById('mealsNotFound').classList.add('hidden')
        meals.map(meal=>addMealToDisplay(meal))
    } else {
        document.getElementById('mealsNotFound').classList.remove('hidden')
    }
}

function getMeals() {
    fetch(mealUrl)
            .then(res=>res.json())
            .then(data=>{
                updateMealDisplay(data.meals)
            })
            .catch(error => {
                console.error('Fetch error:', error)
            })
}

// Create and render the category filters.
function setupCategories() {
        categories.map(category => {
            const option = document.createElement('button')
            option.innerHTML = category.icon+' '+category.id
            option.id = category.id
            option.className = `m-1 cursor-pointer hover:ring-2
                text-green-700 border-1 border-green-700 font-bold py-2 px-4 rounded-full`
            option.onclick = () => switchCategory(category.id)
            document.getElementById('categories').append(option)
            
            if(category.id === 'All') {
                option.classList.add('ring-2')
            }
        })    
}

function switchCategory(option) {
    let url = ''
    if (option === 'All') {
        url = mealUrl
    } else {
        url = mealFilterUrl+option
    }
    fetch(url)
            .then(res=>res.json())
            .then(data=>{
                updateMealDisplay(data.meals)
                toggleCategoryDisplay(option)
            })
            .catch(error => {
                console.error('Fetch error:', error)
            })
}

// Toggle the visual display of selected and non-selected category buttons.
function toggleCategoryDisplay(option) {
    categories.map(category => {
        const button = document.getElementById(category.id)
        if (category.id === option) {
            button.classList.add('ring-2')
        } else {
            button.classList.remove('ring-2')
        }
    })
}