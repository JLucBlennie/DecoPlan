// components/PreferencesScreen.tsx
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import React from 'react';
import {
    Alert, ScrollView, StyleSheet,
    Text, TouchableOpacity, View,
} from 'react-native';

import { usePreferencesStore } from '../store/usePreferencesStore';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

export default function PreferencesScreen() {
    const {
        gfLow, gfHigh, rmvFond, rmvDeco,
        descentRateMMin, ascentRateMMin,
        update, reset,
    } = usePreferencesStore();

    const handleReset = () => {
        Alert.alert(
            'Réinitialiser les préférences',
            'Remettre toutes les valeurs par défaut ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Réinitialiser', style: 'destructive', onPress: reset },
            ],
        );
    };

    return (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

            {/* ── Gradient Factors ──────────────────────────────────────────────── */}
            <Section title="Gradient Factors par défaut"
                subtitle="Utilisés au lancement du calcul et du mode pédagogique">

                <PrefSlider
                    label="GF Low"
                    hint="Conservatisme en profondeur (premier palier)"
                    value={gfLow}
                    min={0.10} max={0.85} step={0.05}
                    format={v => `${Math.round(v * 100)} %`}
                    color={ocean.accent.blue}
                    onChange={v => {
                        update({ gfLow: v, gfHigh: Math.max(gfHigh, v) });
                    }}
                />

                <PrefSlider
                    label="GF High"
                    hint="Conservatisme en surface (dernier palier)"
                    value={gfHigh}
                    min={0.50} max={1.00} step={0.05}
                    format={v => `${Math.round(v * 100)} %`}
                    color={ocean.accent.blue}
                    onChange={v => {
                        update({ gfHigh: v, gfLow: Math.min(gfLow, v) });
                    }}
                />

                {/* Indicateur de pente GF */}
                <View style={styles.gfSlope}>
                    <View style={styles.gfSlopeDotSmall} />
                    <View style={[styles.gfSlopeLine, { borderColor: ocean.accent.blue + '50' }]} />
                    <View style={[styles.gfSlopeDotLarge, { backgroundColor: ocean.accent.blue }]} />
                    <Text style={styles.gfSlopeTxt}>
                        Pente {Math.round(gfLow * 100)}→{Math.round(gfHigh * 100)} %
                        {gfLow <= 0.30 ? '  · conservateur' : gfHigh >= 0.95 ? '  · ouvert' : ''}
                    </Text>
                </View>
            </Section>

            {/* ── Consommation ─────────────────────────────────────────────────── */}
            <Section title="Consommation (RMV surface)"
                subtitle="Volume respiré à la pression de surface">

                <PrefSlider
                    label="RMV fond"
                    hint="Pendant la descente et le fond"
                    value={rmvFond}
                    min={8} max={40} step={1}
                    format={v => `${v} L/min`}
                    color={ocean.accent.teal}
                    onChange={v => update({ rmvFond: v })}
                />

                <PrefSlider
                    label="RMV déco"
                    hint="Pendant les paliers (effort réduit)"
                    value={rmvDeco}
                    min={6} max={30} step={1}
                    format={v => `${v} L/min`}
                    color={ocean.accent.teal}
                    onChange={v => update({ rmvDeco: v })}
                />

                <InfoRow icon="info-outline"
                    text={`À ${rmvFond} L/min fond, un bloc 12 L/200 bar dure env. ${Math.round(12 * 200 / rmvFond)} min en surface (sans pression).`}
                />
            </Section>

            {/* ── Vitesses ─────────────────────────────────────────────────── */}
            <Section title="Vitesses de déplacement"
                subtitle="Norme FFESSM : descente 20 m/min, remontée 9–15 m/min">

                <PrefSlider
                    label="Descente"
                    hint="Vitesse maximale de descente"
                    value={descentRateMMin}
                    min={5} max={30} step={1}
                    format={v => `${v} m/min`}
                    color="#BA7517"
                    onChange={v => update({ descentRateMMin: v })}
                />

                <PrefSlider
                    label="Remontée"
                    hint="Vitesse de remontée entre les paliers"
                    value={ascentRateMMin}
                    min={3} max={15} step={1}
                    format={v => `${v} m/min`}
                    color="#BA7517"
                    onChange={v => update({ ascentRateMMin: v })}
                />

                {ascentRateMMin > 10 && (
                    <InfoRow icon="warning" color="#BA7517"
                        text="Attention : la norme FFESSM recommande ≤ 10 m/min en remontée."
                    />
                )}
            </Section>

            {/* ── Résumé ────────────────────────────────────────────────────── */}
            <Section title="Résumé des réglages">
                <View style={styles.summaryGrid}>
                    <SummaryCell label="GF Low" value={`${Math.round(gfLow * 100)} %`} />
                    <SummaryCell label="GF High" value={`${Math.round(gfHigh * 100)} %`} />
                    <SummaryCell label="RMV fond" value={`${rmvFond} L/min`} />
                    <SummaryCell label="RMV déco" value={`${rmvDeco} L/min`} />
                    <SummaryCell label="Descente" value={`${descentRateMMin} m/min`} />
                    <SummaryCell label="Remontée" value={`${ascentRateMMin} m/min`} />
                </View>
            </Section>

            {/* ── Reset ─────────────────────────────────────────────────────── */}
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
                <MaterialIcons name="restore" size={16} color={ocean.accent.red} />
                <Text style={styles.resetBtnTxt}>Remettre les valeurs par défaut</Text>
            </TouchableOpacity>

            <View style={styles.disclaimer}>
                <MaterialIcons name="info-outline" size={12} color={ocean.text.muted} />
                <Text style={styles.disclaimerTxt}>
                    Ces réglages sont indicatifs. Toujours valider un profil avec un planificateur
                    certifié avant de plonger.
                </Text>
            </View>

        </ScrollView>
    );
}

// ── Sous-composants ───────────────────────────────────────────────────────────

function Section({ title, subtitle, children }: {
    title: string; subtitle?: string; children: React.ReactNode;
}) {
    return (
        <View style={sectionStyles.wrapper}>
            <Text style={sectionStyles.title}>{title}</Text>
            {subtitle && <Text style={sectionStyles.subtitle}>{subtitle}</Text>}
            <View style={sectionStyles.body}>{children}</View>
        </View>
    );
}

const sectionStyles = StyleSheet.create({
    wrapper: { marginBottom: spacing.md },
    title: { fontSize: fontSize.sm, fontWeight: '600', color: ocean.text.primary, marginBottom: 2 },
    subtitle: { fontSize: fontSize.xs, color: ocean.text.muted, marginBottom: spacing.sm },
    body: {
        backgroundColor: ocean.bg.surface,
        borderRadius: radius.md, borderWidth: StyleSheet.hairlineWidth,
        borderColor: ocean.border.subtle,
        padding: spacing.md, gap: spacing.md,
    },
});

function PrefSlider({ label, hint, value, min, max, step, format, color, onChange }: {
    label: string;
    hint: string;
    value: number;
    min: number;
    max: number;
    step: number;
    format: (v: number) => string;
    color: string;
    onChange: (v: number) => void;
}) {
    return (
        <View style={sliderStyles.wrapper}>
            <View style={sliderStyles.header}>
                <View>
                    <Text style={sliderStyles.label}>{label}</Text>
                    <Text style={sliderStyles.hint}>{hint}</Text>
                </View>
                <Text style={[sliderStyles.value, { color }]}>{format(value)}</Text>
            </View>
            <Slider
                style={sliderStyles.slider}
                minimumValue={min} maximumValue={max} step={step}
                value={value}
                onValueChange={onChange}
                minimumTrackTintColor={color}
                maximumTrackTintColor="rgba(255,255,255,0.12)"
                thumbTintColor={color}
            />
            <View style={sliderStyles.axis}>
                <Text style={sliderStyles.axisTxt}>{format(min)}</Text>
                <Text style={sliderStyles.axisTxt}>{format(max)}</Text>
            </View>
        </View>
    );
}

const sliderStyles = StyleSheet.create({
    wrapper: { gap: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    label: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.primary },
    hint: { fontSize: fontSize.xs, color: ocean.text.muted, marginTop: 1 },
    value: { fontSize: fontSize.md, fontWeight: '600' },
    slider: { height: 32, marginHorizontal: -4 },
    axis: { flexDirection: 'row', justifyContent: 'space-between' },
    axisTxt: { fontSize: 9, color: ocean.text.muted },
});

function InfoRow({ icon, text, color }: { icon: string; text: string; color?: string }) {
    return (
        <View style={infoStyles.row}>
            <MaterialIcons name={icon as any} size={13} color={color ?? ocean.text.muted} />
            <Text style={[infoStyles.txt, color ? { color } : undefined]}>{text}</Text>
        </View>
    );
}

const infoStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
    txt: { fontSize: fontSize.xs, color: ocean.text.muted, flex: 1, lineHeight: 16 },
});

function SummaryCell({ label, value }: { label: string; value: string }) {
    return (
        <View style={summaryStyles.cell}>
            <Text style={summaryStyles.label}>{label}</Text>
            <Text style={summaryStyles.value}>{value}</Text>
        </View>
    );
}

const summaryStyles = StyleSheet.create({
    cell: { width: '50%', paddingVertical: 4 },
    label: { fontSize: fontSize.xs, color: ocean.text.muted },
    value: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.primary, marginTop: 1 },
});

// ── Styles principaux ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    scroll: { flex: 1 },
    content: { padding: spacing.md, paddingBottom: spacing.xxl },

    gfSlope: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2,
    },
    gfSlopeDotSmall: {
        width: 6, height: 6, borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    gfSlopeLine: {
        flex: 1, borderTopWidth: 1, borderStyle: 'dashed',
    },
    gfSlopeDotLarge: {
        width: 8, height: 8, borderRadius: 4,
    },
    gfSlopeTxt: { fontSize: fontSize.xs, color: ocean.text.muted },

    summaryGrid: { flexDirection: 'row', flexWrap: 'wrap' },

    resetBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: ocean.soft.red,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        marginBottom: spacing.md,
    },
    resetBtnTxt: { fontSize: fontSize.sm, color: ocean.accent.red },

    disclaimer: {
        flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
        paddingHorizontal: spacing.xs,
    },
    disclaimerTxt: {
        fontSize: 9, color: ocean.text.muted, flex: 1, lineHeight: 14,
    },
});