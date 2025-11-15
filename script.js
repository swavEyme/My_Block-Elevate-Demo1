// Section navigation
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
}

// Shopping cart functionality
let cart = [];
let cartTotal = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Add to cart functionality
    const addCartBtns = document.querySelectorAll('.add-cart-btn');
    addCartBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const productName = productCard.querySelector('h4').textContent;
            const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace('$', ''));
            
            addToCart(productName, productPrice);
        });
    });

    // Mood tracker
    const moodBtns = document.querySelectorAll('.mood-btn');
    moodBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            moodBtns.forEach(b => {
                b.style.background = '#f8f9fa';
                b.style.color = '#000';
                b.style.borderColor = '#666';
            });
            this.style.background = '#dc3545';
            this.style.color = 'white';
            this.style.borderColor = '#dc3545';
            
            setTimeout(() => {
                alert('Mood logged! Keep taking care of yourself 💙');
            }, 500);
        });
    });

    // Meditation timer
    const startBtn = document.querySelector('.start-btn');
    const timerDisplay = document.querySelector('.timer-display');
    let meditationTimer;
    let timeLeft = 300; // 5 minutes

    startBtn.addEventListener('click', function() {
        if (this.textContent === 'Start Session') {
            startMeditation();
        } else {
            stopMeditation();
        }
    });

    function startMeditation() {
        startBtn.textContent = 'Stop Session';
        startBtn.style.background = '#dc3545';
        
        meditationTimer = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                stopMeditation();
                alert('Meditation session complete! Well done 🧘‍♀️');
                timeLeft = 300;
                timerDisplay.textContent = '5:00';
            }
        }, 1000);
    }

    function stopMeditation() {
        clearInterval(meditationTimer);
        startBtn.textContent = 'Start Session';
        startBtn.style.background = '#28a745';
    }

    // Social media post functionality
    const postBtn = document.querySelector('.post-btn');
    const postTextarea = document.querySelector('.post-composer textarea');
    const feed = document.querySelector('.feed');

    postBtn.addEventListener('click', function() {
        const postContent = postTextarea.value.trim();
        if (postContent) {
            createPost(postContent);
            postTextarea.value = '';
        }
    });

    function createPost(content) {
        const post = document.createElement('div');
        post.className = 'post';
        post.innerHTML = `
            <div class="post-header">
                <strong>You</strong>
                <span class="post-time">Just now</span>
            </div>
            <div class="post-content">${content}</div>
            <div class="post-actions">
                <button onclick="likePost(this)">👍 Like</button>
                <button>💬 Comment</button>
                <button>📤 Share</button>
            </div>
        `;
        feed.insertBefore(post, feed.firstChild);
    }

    // Admin functionality
    const adminBtns = document.querySelectorAll('.admin-btn');
    adminBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent;
            alert(`${action} feature would be implemented here in a full application.`);
        });
    });
});

function addToCart(name, price) {
    cart.push({ name, price });
    cartTotal += price;
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItems = document.querySelector('.cart-items');
    const cartTotalDisplay = document.querySelector('.cart-total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => 
            `<div>${item.name} - $${item.price}</div>`
        ).join('');
    }
    
    cartTotalDisplay.textContent = `Total: $${cartTotal}`;
}

function likePost(button) {
    const currentText = button.textContent;
    if (currentText.includes('Like')) {
        button.textContent = '❤️ Liked';
        button.style.color = '#e74c3c';
    } else {
        button.textContent = '👍 Like';
        button.style.color = '#6c757d';
    }
}

// Checkout functionality
document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                alert(`Checkout complete! Total: $${cartTotal}\nThank you for your purchase!`);
                cart = [];
                cartTotal = 0;
                updateCartDisplay();
            } else {
                alert('Your cart is empty!');
            }
        });
    }
});