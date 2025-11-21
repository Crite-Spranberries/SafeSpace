import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal } from './Modal';
import { Button } from './Button';
import { AppText } from './AppText';

type Props = {
  isOpen: boolean;
  title: string;
  description?: string;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: 'destructive' | 'purple';
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmationDialog({
  isOpen,
  title,
  description,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  confirmVariant = 'destructive',
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal isOpen={isOpen} transparent>
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <AppText weight="bold" style={styles.title}>
            {title}
          </AppText>

          {description ? <AppText style={styles.description}>{description}</AppText> : null}

          <View style={styles.buttonRow}>
            <Button
              variant="reallyLightGrey"
              radius="full"
              size="auto"
              style={[styles.buttonFlex, styles.buttonSize]}
              onPress={onCancel}>
              <AppText weight="medium" style={styles.cancelText}>
                {cancelText}
              </AppText>
            </Button>

            <Button
              variant={confirmVariant}
              radius="full"
              size="auto"
              style={[styles.buttonFlex, styles.buttonSize]}
              onPress={onConfirm}>
              <AppText weight="medium" style={styles.confirmText}>
                {confirmText}
              </AppText>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
    color: '#000',
    marginBottom: 16,
  },
  description: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    color: '#000',
    marginBottom: 6,
  },
  wrapper: {
    width: '100%',
    paddingHorizontal: 12,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#efefef',
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 16,
  },
  buttonRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  buttonFlex: {
    flex: 1,
  },
  buttonSize: {
    height: 48,
    paddingHorizontal: 24,
  },
  cancelText: {
    color: '#5E349E',
    fontSize: 16,
    lineHeight: 20,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
  },
});
