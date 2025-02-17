from flask import Flask, request, jsonify # type: ignore
from flask_sqlalchemy import SQLAlchemy # type: ignore
from flask_bcrypt import Bcrypt # type: ignore
from flask_cors import CORS # type: ignore

app = Flask(__name__)
CORS(app)

# Configure Database (SQLite)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///appointments.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(15), nullable=False)
    password = db.Column(db.String(255), nullable=False)

# Appointment Model
class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(100), nullable=False)
    doctor = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(20), nullable=False)
    time = db.Column(db.String(10), nullable=False)

# Create Tables (Run only once)
with app.app_context():
    db.create_all()

# User Registration
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    new_user = User(name=data['name'], email=data['email'], phone=data['phone'], password=hashed_pw)
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User registered successfully!'})

# User Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Login successful!', 'user': user.name})
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

# Book Appointment
@app.route('/book', methods=['POST'])
def book_appointment():
    data = request.json
    
    new_appointment = Appointment(
        user_email=data['email'], 
        doctor=data['doctor'], 
        date=data['date'], 
        time=data['time']
    )
    db.session.add(new_appointment)
    db.session.commit()
    
    return jsonify({'message': 'Appointment booked successfully!'})

# Get Appointments for a User
@app.route('/appointments/<email>', methods=['GET'])
def get_appointments(email):
    appointments = Appointment.query.filter_by(user_email=email).all()
    
    return jsonify([{
        'doctor': appt.doctor,
        'date': appt.date,
        'time': appt.time
    } for appt in appointments])

if __name__ == '__main__':
    app.run(debug=True)
