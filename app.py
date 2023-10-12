# サーバーサイドのPythonコード (app.py)
from flask import Flask, request, jsonify,render_template
import Levenshtein
import sqlite3
import pandas as pd

app = Flask(__name__)

# リストの例（ここに検証したいテキストを追加）
my_list = [str(i) for i in range(1, 1001)]
zf330list = [str(i).zfill(4) for i in range(10000)]
# print(my_list)
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/onsei')
def index2():
    return render_template('index2.html')

@app.route('/process', methods=['POST'])
def process_text():
    data = request.get_json()
    user_input = data.get('text', '')  # ブラウザから送られた音声認識のテキスト

    # Levenshtein距離を計算し、最も近い要素を見つける
    closest_element = min(my_list, key=lambda x: Levenshtein.distance(x, user_input))

    return jsonify({'result': closest_element})

@app.route('/process2', methods=['POST'])
def process_text2():
    data = request.get_json()
    user_input = data.get('text', '')  # ブラウザから送られた音声認識のテキスト

    # Levenshtein距離を計算し、最も近い要素を見つける
    closest_element = min(zf330list, key=lambda x: Levenshtein.distance(x, user_input))

    return jsonify({'result': f'ZF330-I00{closest_element}'})


@app.route('/record', methods=['POST'])
def update_product():
    try:
        conn = sqlite3.connect(r'C:\Users\Administrator\Desktop\server\python\test3\mydatabase.db')
        cursor = conn.cursor()
        # POSTデータから商品IDまたはJANデータを取得
        print('u')
        jan_id = request.form.get('jan')
        zf330_id = request.form.get('zf330')
        if jan_id is not None:    
            cursor.execute("SELECT * FROM products WHERE JAN = ?", [jan_id])
        elif zf330_id is not None:
            cursor.execute("SELECT * FROM products WHERE 商品ID = ?", [zf330_id])
            print('e')
        # データベース内で商品IDまたはJANデータを検索
        record = cursor.fetchone()
        print(record)
        if record:
            # レコードが存在する場合、縦、横、高さの情報をアップデート
            new_height = request.form.get('new_height')
            new_width = request.form.get('new_width')
            new_length = request.form.get('new_length')
            # if(product_id == 'jan'):
            if zf330_id is not None:
                cursor.execute("UPDATE products SET 縦 = ?, 横 = ?, 高さ = ? WHERE 商品ID = ?", (new_height, new_width, new_length, record[0]))
            elif jan_id is not None:   
                cursor.execute("UPDATE products SET 縦 = ?, 横 = ?, 高さ = ? WHERE JAN = ?", (new_height, new_width, new_length, record[1]))
            conn.commit()
            text ="データが正常にアップデートされました。"
            return render_template('check.html', text=text)
        else:
            # レコードが存在しない場合、エラーメッセージを表示しエラーページにリダイレクト
            text = "商品が見つかりません。入力に誤りがある可能性があります。"
            return render_template('check.html', text=text)
    except Exception as e:
        conn.rollback()
        text = f"データのアップデート中にエラーが発生しました: {str(e)}"
        return render_template('check.html', text=text)


@app.route('/list')
def list_products():
    # SQLiteデータベースに接続し、商品情報をデータフレームに読み込む
    conn = sqlite3.connect(r'C:\Users\Administrator\Desktop\server\python\test3\mydatabase.db')  # データベースファイル名を適切なものに変更
    query = 'SELECT 商品ID, 商品名,縦,横,高さ FROM products where 縦>0'
    df = pd.read_sql(query, conn)
    conn.close()

    # データの加工: ここでデータを加工する例を示します（必要に応じてカスタマイズ）
    df['縦'] = df['縦'].apply(lambda x: int(x))  # サイズを小数点2桁に丸める
    df['横'] = df['横'].apply(lambda x: int(x))
    df['高さ'] = df['高さ'].apply(lambda x: int(x))
    # データフレームをHTML形式に変換
    table_html = df.to_html(classes='table table-bordered table-hover', index=False, escape=False)

    # HTMLテンプレートに商品情報を渡してレンダリング
    return render_template('product_list.html', table_html=table_html)


if __name__ == '__main__':
    app.run(debug=True,port=8000)
