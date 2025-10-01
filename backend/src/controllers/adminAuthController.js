const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Hardcoded admin credentials
    const ADMIN_USERNAME = 'amol123';
    const ADMIN_PASSWORD = 'amol@2004';
    
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    // Create admin user object (not stored in database)
    const adminUser = {
      _id: 'admin-001',
      name: 'Admin',
      email: 'admin@pw-lms.com',
      role: 'admin'
    };
    
    const token = generateToken(adminUser);
    res.json({
      user: { id: adminUser._id, name: adminUser.name, email: adminUser.email, role: adminUser.role },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 