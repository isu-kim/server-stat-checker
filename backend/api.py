from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

@app.route('/api/check', methods=['POST'])
def check_port():
    ip = request.json.get('ip')
    port = request.json.get('port')

    try:
        result = subprocess.run(['nc', '-zv', ip, str(port)], capture_output=True, timeout=2)
        if result.returncode == 0:
            print(f"Testing {ip}:{port} -> ok")
            return jsonify({'message': 'Port is accessible.'}), 200
        else:
            print(f"Testing {ip}:{port} -> not ok")
            return jsonify({'message': 'Port is not accessible.'}), 400
    except subprocess.TimeoutExpired:
        print(f"Testing {ip}:{port} -> timeout")
        return jsonify({'message': 'Port check timed out.'}), 400
    except Exception as e:
        return jsonify({'message': str(e)}), 400

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001)

