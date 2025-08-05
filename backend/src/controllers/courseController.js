const Course = require('../models/Course');
const Lecture = require('../models/Lecture');

exports.createCourse = async (req, res) => {
  try {
    const { title, description, thumbnail, price, syllabus, category, level, duration, tags } = req.body;
    
    // For admin users, we need to handle the createdBy field differently
    // since admin is not stored in the database
    let courseData = {
      title,
      description,
      thumbnail,
      price: price || 0,
      syllabus,
      category: category || 'Other',
      level: level || 'Beginner',
      duration: duration || 0,
      tags: tags || [],
    };
    
    // Only add createdBy if it's a valid ObjectId (regular user)
    if (req.user.role !== 'admin') {
      courseData.createdBy = req.user.id;
    }
    
    const course = await Course.create(courseData);
    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('createdBy', 'name email');
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.searchCourses = async (req, res) => {
  try {
    const { searchTerm, category, level, priceMin, priceMax, instructor } = req.query;
    
    let query = {};
    
    // Text search
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ];
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Level filter
    if (level) {
      query.level = level;
    }
    
    // Price range filter
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }
    
    // Instructor filter
    if (instructor) {
      // This would need to be implemented with a lookup if you want to search by instructor name
      // For now, we'll skip this filter
    }
    
    const courses = await Course.find(query).populate('createdBy', 'name email');
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('lectures').populate('createdBy', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    // Optionally delete related lectures
    await Lecture.deleteMany({ course: course._id });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Teacher-specific controller functions
exports.getTeacherCourses = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const courses = await Course.find({ createdBy: req.user.id }).populate('createdBy', 'name email');
    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createTeacherCourse = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const { title, description, thumbnail, price, syllabus, category, level, duration, tags } = req.body;
    
    const courseData = {
      title,
      description,
      thumbnail,
      price: price || 0,
      syllabus,
      category: category || 'Other',
      level: level || 'Beginner',
      duration: duration || 0,
      tags: tags || [],
      createdBy: req.user.id
    };
    
    const course = await Course.create(courseData);
    res.status(201).json(course);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateTeacherCourse = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const course = await Course.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found or access denied' });
    }
    
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCourse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteTeacherCourse = async (req, res) => {
  try {
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied. Teacher only.' });
    }
    
    const course = await Course.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!course) {
      return res.status(404).json({ message: 'Course not found or access denied' });
    }
    
    await Course.findByIdAndDelete(req.params.id);
    // Optionally delete related lectures
    await Lecture.deleteMany({ course: course._id });
    res.json({ message: 'Course deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 