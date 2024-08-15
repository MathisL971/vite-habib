from flask import Flask, jsonify, request
import win32com.client
import pythoncom
from dotenv import load_dotenv
import os
import jwt
from flask_cors import CORS
import datetime

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

def query_database(query, table):
    pythoncom.CoInitialize()

    try:
        conn = win32com.client.Dispatch('ADODB.Connection')

        provider = 'Provider=PCSOFT.HFSQL'
        ds = 'Data Source=localhost:' + os.getenv('HFSQL_PORT')
        db = 'Initial Catalog=' + os.getenv('HFSQL_DB')
        creds = 'User ID=' + os.getenv('HFSQL_USER') + ';Password=' + os.getenv('HFSQL_PASSWORD')
        ex_props = 'Extended Properties="Password=' + table + ':' + os.getenv('HFSQL_TABLE_PASSWORD') + '"'

        conn.Open(provider + ';' + ds + ';' + db + ';' + creds + ';' + ex_props)

        rs = win32com.client.Dispatch('ADODB.Recordset')

        rs.Open(query, conn)

        results = []
        while not rs.EOF:
            record = {field.Name: field.Value for field in rs.Fields}
            results.append(record)
            rs.MoveNext()

        rs.Close()
        conn.Close()

        return results
    finally:
        pythoncom.CoUninitialize()

@app.route('/api/customers', methods=['GET'])
def get_customers():
    table = 'Customer'
    query = 'SELECT * FROM ' + table
    results = query_database(query, table)
    return jsonify(results)

@app.route('/', methods=['POST'])
def login():
    try:
        data = request.json

        email = data.get('email')
        password = data.get('password')

        table = 'USER'
        query = f"SELECT * FROM {table} WHERE Email = '{email}'"
        results = query_database(query, table)

        if len(results) == 0 or results[0]['PASSWORD'] != password:
            return jsonify({
                'error': 'utilisateur ou mot de passe incorrect',
            }), 401

        user = results[0]

        payload = {
            'email': email,
            'id': user['ID'],
            'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1),
        }
        token = jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm='HS256')

        return jsonify({
            'message': 'Utilisateur connecté',
            'token': token,
        }), 200
    except Exception as e:
        print('Error logging in user: ', e)
        return 'Internal Server Error', 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)