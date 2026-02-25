/*
    Notes

    Use localStorage key/value pairs to store data across the session (insecure for sensistive data)

    cart.find(c=>c.mealId === mealId)
    - find if an item added to the cart already exists in the cart

    cart.push({mealId, mealName, price, quantity: 1})
    - add a new item to the cart

    
    API URLs
    - Meals: https://www.themealdb.com/api/json/v1/1/search.php?s=c
    - List by Ingredient: https://www.themealdb.com/api/json/v1/1/list.php?c=list
    - Filter by ingredient: https://www.themealdb.com/api/json/v1/1/filter.php?i=chicken_breast
    - Filter by category: https://www.themealdb.com/api/json/v1/1/filter.php?c=Seafood


    Define a formula for creating prices using mealId so prices remain the same across sessions

*/
function logout() {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('email')
    localStorage.removeItem('cart')
    window.location.href = '/login.html'
}

function addMealToDisplay(item) {

    let meal = document.createElement('div')
    meal.className = 'meal m-10'
    meal.id = item.idMeal

    let img = document.createElement('img')
    img.src = item.strMealThumb
    img.alt = item.strMeal
    img.className = "w-64 rounded-lg mb-2"
    
    let info = document.createElement('div')
    info.className = 'grid grid-cols-1'
    
    let title = document.createElement('div')
    title.textContent = item.strMeal
    title.className = 'text-lg font-medium'

    // MODIFY THE MEAL ID TO CREATE A PRICE FOR THE MEAL
    let priceValue = Number(item.idMeal) - 50000
    let price = document.createElement('div')
    price.textContent = `$${(priceValue/100).toFixed(2)}` // DISPLAY PRICE WITH TWO DIGITS

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

    // Check if the item already exists in the cart
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
    console.log('remove', item)
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

// SET ENABLED/DISABLED STATE FOR A BUTTON
function setButtonState(btn, enabled) {
    btn.disabled = !enabled
    btn.classList.toggle('opacity-50', !enabled)
    btn.classList.toggle('cursor-not-allowed', !enabled)
    btn.classList.toggle('cursor-pointer', enabled)
}

function populateCartDisplay(cart) {
    
    const cartList = document.getElementById('cartList')

    // UPDATE TOTALS FOR CART QUANTITY AND CART COST
    const totals = cart.reduce((acc, i) => {
            acc.quantity += i.quantity
            acc.cost += i.quantity * i.price
            return acc
        }, {quantity: 0, cost: 0}
    )

    // SHOW TOTAL NUMBER OF ITEMS IN THE HEADER AND CART PANEL
    document.getElementById('itemCountInHeader').textContent = `(${totals.quantity})`
    document.getElementById('itemCountInCart').textContent = `(${totals.quantity})`
    
    // CONVERT THE CART TOTAL FROM INTEGER TO TWO-DIGIT DECIMAL FOR DISPLAY
    document.getElementById('cartTotal').textContent = `$${(totals.cost/100).toFixed(2)}`
    
    // IF CART IS EMPTY, DISPLAY EMPTY CART MESSAGE AND DISABLE CHECKOUT BUTTOn
    // ELSE DISPLAY CART ITEMS AND ENABLE CHECKOUT BUTTON
    if (totals.quantity === 0) {
        document.getElementById('cartEmpty').classList.remove('hidden')
        setButtonState(document.getElementById('checkoutBtn'), false)

    } else {
        document.getElementById('cartEmpty').classList.add('hidden')
        setButtonState(document.getElementById('checkoutBtn'), true)
    }

    // POPULATE CART LIST WITH ITEMS IN CART
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

function openCart() {
    cartPanel.classList.remove('translate-x-full')
    overlay.classList.remove('opacity-0', 'pointer-events-none')
    overlay.classList.add('opacity-100')
}

function closeCart() {
    cartPanel.classList.add('translate-x-full')
    overlay.classList.add('opacity-0', 'pointer-events-none')
    overlay.classList.remove('opacity-100')
}

function getMeals() {
    fetch(mealUrl)
            .then(res=>res.json())
            .then(data=>{
                console.log('MEALS API', data)
                data.meals.map(meal=>addMealToDisplay(meal))
            })
            .catch(error => {
                console.error('Fetch error:', error)
            })
}

// INITIALIZE CONSTANTS
const mealUrl = 'https://www.themealdb.com/api/json/v1/1/search.php?s='
const email = localStorage.getItem('email')

// INITIALIZE EVENT LISTENERS TO SHOW AND HIDE CART
document.getElementById('cartBtn').addEventListener('click', openCart)
document.getElementById('closeCartBtn').addEventListener('click', closeCart)
overlay.addEventListener('click', closeCart)

// CHECK IF USER IS LOGGED IN AND DIRECT TO LOGIN PAGE IF NOT
if (localStorage.getItem('isLoggedIn') !== 'true') {
    logout()
}

// DISPLAY EMAIL IN WELCOME MESSAGE
if (email) {
    document.getElementById('h1Header').textContent = `Welcome back, ${email}!`
}

// REPOPULATE THE CART IF ITEMS ARE AVAILABLE
if(localStorage.getItem('cart')) {
    const cart = JSON.parse(localStorage.getItem('cart'))
    populateCartDisplay(cart)
}

// GET AVAILABLE MEALS FROM API
getMeals();