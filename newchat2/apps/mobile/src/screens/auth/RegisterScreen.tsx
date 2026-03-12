import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { api } from '../../services/api';

function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const show = useCallback((msg: string, type: 'success' | 'error' = 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);
  return { toast, show };
}

export function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast, show: showToast } = useToast();

  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      showToast('모든 항목을 입력해주세요.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('비밀번호가 일치하지 않습니다.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('비밀번호는 6자 이상이어야 합니다.', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/register', { email, password, displayName });
      navigation.navigate('Login', { successMsg: '회원가입이 완료되었습니다. 로그인해주세요.' });
    } catch (err: any) {
      showToast(err.response?.data?.message || '회원가입에 실패했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {toast && (
        <View style={[styles.toast, toast.type === 'error' ? styles.toastError : styles.toastSuccess]}>
          <Text style={[styles.toastText, toast.type === 'error' ? styles.toastTextError : styles.toastTextSuccess]}>
            {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
          </Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>회원가입</Text>
        <TextInput
          style={styles.input}
          placeholder="닉네임"
          value={displayName}
          onChangeText={setDisplayName}
        />
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 (6자 이상)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? '처리 중...' : '가입하기'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
          <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  toast: {
    position: 'absolute', top: 40, left: 16, right: 16,
    borderRadius: 10, padding: 12, zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6,
  },
  toastSuccess: { backgroundColor: '#e6f9ee' },
  toastError: { backgroundColor: '#fff0f0' },
  toastText: { fontSize: 14, textAlign: 'center' },
  toastTextSuccess: { color: '#1a7a3c' },
  toastTextError: { color: '#c0392b' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#FEE500', borderRadius: 8, padding: 16, alignItems: 'center', marginBottom: 12 },
  disabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  link: { alignItems: 'center', marginTop: 8 },
  linkText: { color: '#888', fontSize: 14 },
});
