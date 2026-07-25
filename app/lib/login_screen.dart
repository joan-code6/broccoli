import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // 입력한 값을 저장할 변수
  String myUsername = "";
  String myPassword = "";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("Login", style: TextStyle(fontSize: 30)),

            SizedBox(height: 20),

            // 아이디 입력창
            TextField(
              decoration: InputDecoration(hintText: "아이디를 입력하세요"),
              onChanged: (text) {
                myUsername = text;
              },
            ),

            SizedBox(height: 10),

            // 비밀번호 입력창
            TextField(
              obscureText: true, // 비밀번호 가려주기
              decoration: InputDecoration(hintText: "비밀번호를 입력하세요"),
              onChanged: (text) {
                myPassword = text;
              },
            ),

            SizedBox(height: 20),

            // 로그인 버튼
            ElevatedButton(
              onPressed: () {
                print("아이디: " + myUsername);
                print("비번: " + myPassword);
              },
              child: Text("로그인"),
            ),
          ],
        ),
      ),
    );
  }
}
