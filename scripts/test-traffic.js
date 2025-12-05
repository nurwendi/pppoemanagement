// Test script to check what data Mikrotik provides for real-time traffic

async function testTraffic() {
    try {
        const res = await fetch('http://localhost:3000/api/pppoe/active');
        const data = await res.json();
        console.log('First active user:', data[0]);
    } catch (error) {
        console.error('Error:', error);
    }
}

testTraffic();
