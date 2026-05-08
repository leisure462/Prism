import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '../store/settingsStore';
import { themes, fontOptions } from '../utils/theme';
import IconButton from '../components/IconButton';

const flipTypeLabels: Record<string, string> = {
  slide: '滑动翻页',
  tap: '点击翻页',
  volume: '音量键翻页',
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const settings = useSettingsStore();
  const theme = themes[settings.theme] || themes.vellum;

  const SettingRow = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.rowControl}>{children}</View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.divider }]}>
        <IconButton label="← 返回" onPress={() => navigation.goBack()} color={theme.text} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>阅读设置</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>显示</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
          <SettingRow label="字号">
            <View style={styles.stepper}>
              <Pressable onPress={() => settings.setFontSize(Math.max(12, settings.fontSize - 1))}>
                <Text style={[styles.stepperBtn, { color: theme.accent }]}>−</Text>
              </Pressable>
              <Text style={[styles.stepperValue, { color: theme.text }]}>{settings.fontSize}px</Text>
              <Pressable onPress={() => settings.setFontSize(Math.min(32, settings.fontSize + 1))}>
                <Text style={[styles.stepperBtn, { color: theme.accent }]}>+</Text>
              </Pressable>
            </View>
          </SettingRow>

          <SettingRow label="行距">
            <View style={styles.stepper}>
              <Pressable onPress={() => settings.setLineHeight(Math.max(1.2, settings.lineHeight - 0.1))}>
                <Text style={[styles.stepperBtn, { color: theme.accent }]}>−</Text>
              </Pressable>
              <Text style={[styles.stepperValue, { color: theme.text }]}>{settings.lineHeight.toFixed(1)}</Text>
              <Pressable onPress={() => settings.setLineHeight(Math.min(2.5, settings.lineHeight + 0.1))}>
                <Text style={[styles.stepperBtn, { color: theme.accent }]}>+</Text>
              </Pressable>
            </View>
          </SettingRow>

          <SettingRow label="段间距">
            <View style={styles.stepper}>
              <Pressable onPress={() => settings.setParagraphSpacing(Math.max(0, settings.paragraphSpacing - 2))}>
                <Text style={[styles.stepperBtn, { color: theme.accent }]}>−</Text>
              </Pressable>
              <Text style={[styles.stepperValue, { color: theme.text }]}>{settings.paragraphSpacing}px</Text>
              <Pressable onPress={() => settings.setParagraphSpacing(Math.min(32, settings.paragraphSpacing + 2))}>
                <Text style={[styles.stepperBtn, { color: theme.accent }]}>+</Text>
              </Pressable>
            </View>
          </SettingRow>

          <SettingRow label="水平边距">
            <View style={styles.stepper}>
              <Pressable onPress={() => settings.setMarginHorizontal(Math.max(8, settings.marginHorizontal - 4))}>
                <Text style={[styles.stepperBtn, { color: theme.accent }]}>−</Text>
              </Pressable>
              <Text style={[styles.stepperValue, { color: theme.text }]}>{settings.marginHorizontal}px</Text>
              <Pressable onPress={() => settings.setMarginHorizontal(Math.min(48, settings.marginHorizontal + 4))}>
                <Text style={[styles.stepperBtn, { color: theme.accent }]}>+</Text>
              </Pressable>
            </View>
          </SettingRow>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>字体</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
          {fontOptions.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.fontRow, { borderBottomColor: theme.divider }]}
              onPress={() => settings.setFontFamily(opt.value)}
            >
              <Text style={[styles.fontName, { color: theme.text, fontFamily: opt.value === 'System' ? undefined : opt.value }]}>
                {opt.label}
              </Text>
              {settings.fontFamily === opt.value && (
                <Text style={[styles.checkMark, { color: theme.accent }]}>✓</Text>
              )}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>主题</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
          {Object.entries(themes).map(([key, t]) => (
            <Pressable
              key={key}
              style={[
                styles.themeRow,
                { borderBottomColor: theme.divider },
                key === Object.keys(themes)[Object.keys(themes).length - 1] && { borderBottomWidth: 0 },
              ]}
              onPress={() => settings.setTheme(key)}
            >
              <View style={styles.themeInfo}>
                <View style={[styles.themePreview, { backgroundColor: t.background, borderColor: t.divider }]}>
                  <Text style={{ color: t.text, fontSize: 10 }}>Aa</Text>
                </View>
                <Text style={[styles.themeName, { color: theme.text }]}>{t.name}</Text>
              </View>
              {settings.theme === key && (
                <Text style={[styles.checkMark, { color: theme.accent }]}>✓</Text>
              )}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>翻页</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
          {(Object.keys(flipTypeLabels) as Array<keyof typeof flipTypeLabels>).map((key) => (
            <Pressable
              key={key}
              style={[styles.fontRow, { borderBottomColor: theme.divider }]}
              onPress={() => settings.setFlipType(key)}
            >
              <Text style={[styles.fontName, { color: theme.text }]}>{flipTypeLabels[key]}</Text>
              {settings.flipType === key && (
                <Text style={[styles.checkMark, { color: theme.accent }]}>✓</Text>
              )}
            </Pressable>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>偏好</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
          <SettingRow label="屏幕常亮">
            <Switch
              value={settings.keepScreenOn}
              onValueChange={settings.setKeepScreenOn}
              trackColor={{ false: '#dedcd1', true: '#d97757' }}
              thumbColor="#ffffff"
            />
          </SettingRow>

          <SettingRow label="显示状态栏">
            <Switch
              value={settings.showStatusBar}
              onValueChange={settings.setShowStatusBar}
              trackColor={{ false: '#dedcd1', true: '#d97757' }}
              thumbColor="#ffffff"
            />
          </SettingRow>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Lora',
    fontWeight: '400',
  },
  content: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    borderRadius: 9.6,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  rowLabel: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  rowControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepperBtn: {
    fontSize: 20,
    fontWeight: '400',
    width: 28,
    textAlign: 'center',
  },
  stepperValue: {
    fontSize: 14,
    fontFamily: 'Inter',
    minWidth: 50,
    textAlign: 'center',
  },
  fontRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  fontName: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themePreview: {
    width: 32,
    height: 32,
    borderRadius: 9.6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeName: {
    fontSize: 15,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
  checkMark: {
    fontSize: 16,
    fontWeight: '600',
  },
});
