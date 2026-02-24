#!/usr/bin/env python3
"""验证火山引擎认证是否有效"""
import os
import json
import requests
from volcengine.auth.SignerV4 import SignerV4

ak = os.environ.get('VOLCENGINE_AK')
sk = os.environ.get('VOLCENGINE_SK')

if not ak or not sk:
    print("错误: 请设置 VOLCENGINE_AK 和 VOLCENGINE_SK")
    exit(1)

print(f"AK: {ak[:15]}...")
print(f"SK: {sk[:15]}...")
print()

# 构建请求
body = {
    "req_key": "jimeng_t2i_v40",
    "prompt": "test",
    "aspect_ratio": "1:1", 
    "image_number": 1,
    "seed": 12345
}

payload = json.dumps(body, ensure_ascii=True, separators=(', ', ': '))
print(f"请求体: {payload}")

# 使用官方SDK签名
from volcengine.auth.Metadata import Metadata
from urllib.parse import urlparse

class Request:
    def __init__(self):
        self.method = "POST"
        self.scheme = "https"
        self.host = "visual.volcengineapi.com"
        self.path = "/"
        self.params = {"Action": "CVSync2AsyncSubmitTask", "Version": "2022-08-31"}
        self.headers = {
            "Host": "visual.volcengineapi.com",
            "Content-Type": "application/json",
        }
        self.region = "cn-north-1"
        self.service = "cv"
        self.body = payload
        self.time = None
        self.timeout = 30
        self.connection_timeout = 30

req = Request()
meta = Metadata(service=req.service, region=req.region, params=req.params)

print("\n正在发送请求...")
try:
    from volcengine.Credentials import Credentials
    cred = Credentials(ak=ak, sk=sk, session_token=None)
    SignerV4.sign(req, cred, meta)
    
    url = f"https://{req.host}{req.path}?Action=CVSync2AsyncSubmitTask&Version=2022-08-31"
    resp = requests.post(url, headers=req.headers, data=payload, timeout=30)
    
    print(f"状态码: {resp.status_code}")
    print(f"响应: {resp.text[:500]}")
    
    if resp.status_code == 401:
        print("\n❌ 401错误: AK/SK不正确或服务未开通")
    elif resp.status_code == 200:
        print("\n✅ 认证成功！TS脚本应该也能工作")
    else:
        print(f"\n⚠️ 其他错误: {resp.status_code}")
        
except Exception as e:
    print(f"错误: {e}")
