import json
from elasticsearch import Elasticsearch, helpers
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)


CORS(app)  # Allow cross-origin requests (if the frontend is hosted elsewhere)


# Keep the existing functions: connect_to_elastic, create_index_with_mapping, etc.

@app.route("/load-data", methods=["POST"])
def load_data_route():
    """
    Endpoint to load data into Elasticsearch from a frontend upload.
    """
    try:
        file = request.files['file']  # Get the file from the frontend request
        if not file:
            return jsonify({"error": "No file uploaded"}), 400
    
        # Save the uploaded file locally
        file_path = f"/tmp/{file.filename}"
        file.save(file_path)

        # Load data into Elasticsearch
        cloud_id = request.form['cloud_id']
        api_key = request.form['api_key']
        index_name = request.form['index_name']
        es = connect_to_elastic(cloud_id, api_key)
        if not es:
            return jsonify({"error": "Failed to connect to Elasticsearch"}), 500

        create_index_with_mapping(es, index_name)
        load_data_to_elasticsearch(es, index_name, file_path)
        return jsonify({"message": f"Data from '{file.filename}' indexed successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/search", methods=["GET"])
def search_route():
    """
    Endpoint to search data in Elasticsearch.
    """
    try:
        cloud_id = request.args.get('cloud_id')
        api_key = request.args.get('api_key')
        index_name = request.args.get('index_name')
        keyword = request.args.get('keyword')
        mname = request.args.get('mname')

        es = connect_to_elastic(cloud_id, api_key)
        if not es:
            return jsonify({"error": "Failed to connect to Elasticsearch"}), 500

        result = search_by_keyword(es, index_name, keyword, mname)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def connect_to_elastic(cloud_id, api_key):
    """
    Connect to Elasticsearch using the Cloud ID and API Key.
    """
    try:
        es = Elasticsearch(
            cloud_id=cloud_id,
            api_key=api_key
        )
        if es.ping():
            print("Connected to Elasticsearch!")
            return es
        else:
            print("Failed to connect to Elasticsearch.")
            return None
    except Exception as e:
        print(f"Error connecting to Elasticsearch: {e}")
        return None

def create_index_with_mapping(es, index_name):
    """
    Create an Elasticsearch index with a predefined mapping.
    """
    try:
        # Define the mapping
        mapping = {
            "mappings": {
                "properties": {
                    "Name": {"type": "text"},
                    "Miles_per_Gallon": {"type": "float"},
                    "Cylinders": {"type": "integer"},
                    "Displacement": {"type": "float"},
                    "Horsepower": {"type": "float"},
                    "Weight_in_lbs": {"type": "integer"},
                    "Acceleration": {"type": "float"},
                    "Year": {"type": "date", "format": "yyyy-MM-dd"},
                    "Origin": {"type": "keyword"}
                }
            }
        }

        # Create the index
        if not es.indices.exists(index=index_name):
            es.indices.create(index=index_name, body=mapping)
            print(f"Index '{index_name}' created successfully!")
        else:
            print(f"Index '{index_name}' already exists.")
    except Exception as e:
        print(f"Error creating index: {e}")

def load_data_to_elasticsearch(es, index_name, file_path):
    """
    Load JSON data from a file and index it into Elasticsearch.
    """
    try:
        # Load data from JSON file
        with open(file_path, "r") as f:
            data = json.load(f)

        # Use helpers.bulk for efficient indexing
        actions = [
            {
                "_index": index_name,
                "_source": record
            }
            for record in data
        ]
        helpers.bulk(es, actions)
        print(f"Data from '{file_path}' indexed successfully!")
    except Exception as e:
        print(f"Error loading data to Elasticsearch: {e}")

def search_by_keyword(es, index_name, keyword, mname):
    """
    Search Elasticsearch index for documents using a keyword.
    """
    try:
        query = {
            "query": {
                "match": {
                    keyword: mname
                }
            }
        }

        response = es.search(index=index_name, body=query)
        hits = response.get('hits', {}).get('hits', [])
        
        if not hits:
            print(f"No documents found for '{mname}' in field '{keyword}'.")
            return {"success":"this works!"}
        else:
            print(f"Found {len(hits)} result(s) for '{mname}':")
            for hit in hits:
                source = hit['_source']
                print(json.dumps(source, indent=4))
                return {"success":f"{json.dumps(source, indent=4)}"}
    except Exception as e:
        print(f"Error searching Elasticsearch: {e}")
        return {"failure":e}
@app.route("/", methods=["POST"])
def main_route():
    """
    Main function to create an index, load data, and search in Elasticsearch.
    """
    try:
        # Parse the incoming JSON request
        request_data = request.get_json()
        if not request_data or "searchTerm" not in request_data:
            return jsonify({"error": "Invalid request, 'searchTerm' is required"}), 400

        # Retrieve the searchTerm from the request
        mname = request_data["searchTerm"].strip()
        if not mname:
            mname = "default-car"  # Set a default value if searchTerm is empty

        print(f"Search term received: {mname}")

        # Input Elastic Cloud credentials
        cloud_id = "46a8ed2426cd48cdaefd07c667cfcf05:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQxODUyOTlmOWViZGE0MzdhOTc0MTRjOGYwMjMwNTEzZSRmYzE2ZDQyMzIxNGM0YTA5YmFkOWM2N2FlODExNTU1NQ=="
        api_key = "anVsRWdKTUJldUpZWHBXUlUyRWE6QmpLRi1uYWhSLXkwV3hLQjhyT1Bmdw=="

        # Connect to Elasticsearch
        es = connect_to_elastic(cloud_id, api_key)
        if not es:
            return jsonify({"error": "Failed to connect to Elasticsearch"}), 500

        # Define index name
        index_name = "cars"

        # Create index with mapping
        create_index_with_mapping(es, index_name)

        # Load data from JSON file
        file_path = "cars.json"  # Replace with the correct file path
        load_data_to_elasticsearch(es, index_name, file_path)

        # Search by keyword
        keyword = "Name"  # Elasticsearch field to search
        result = search_by_keyword(es, index_name, keyword, mname)

        # Return the result of the search
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == "__main__":
    app.run(debug=True)
