// components/PlongeeProfileGraph.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Architecture :
//   PlongeeProfileGraph        ← composant principal, orchestre les 3 parties
//   ├── DiveProfileSvg         ← SVG visualisation uniquement (pas d'interaction)
//   ├── SegmentList            ← liste avec edit / delete par ligne
//   └── SegmentFormSheet       ← bottom sheet add / edit
//
// API simplifiée :
//   onSegmentsChange(segments) ← un seul callback au lieu de onAdd + onUpdate
// ─────────────────────────────────────────────────────────────────────────────

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
  Keyboard, KeyboardAvoidingView,
  Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput,
  TouchableOpacity, View
} from 'react-native';
import Svg, { Defs, Line, LinearGradient, Path, Polyline, Stop, Text as SvgText } from 'react-native-svg';

import { Gas, Segment } from '../lib/dive';
import { fontSize, ocean, radius, spacing } from '../styles/theme';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  segments: Segment[];
  gazFondList: Gas[];
  onSegmentsChange: (segments: Segment[]) => void;
};

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────

export default function PlongeeProfileGraph({
  segments, gazFondList, onSegmentsChange,
}: Props) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Segment affiché dans le formulaire (null = ajout)
  const editingSegment = editingIndex !== null ? segments[editingIndex] : null;

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setSheetVisible(true);
  };

  const handleAdd = () => {
    setEditingIndex(null);
    setSheetVisible(true);
  };

  const handleDelete = (index: number) => {
    onSegmentsChange(segments.filter((_, i) => i !== index));
  };

  const handleSave = (seg: Segment) => {
    if (editingIndex !== null) {
      // Édition
      const next = [...segments];
      next[editingIndex] = seg;
      onSegmentsChange(next);
    } else {
      // Ajout
      onSegmentsChange([...segments, seg]);
    }
    setSheetVisible(false);
    setEditingIndex(null);
  };

  const handleClose = () => {
    setSheetVisible(false);
    setEditingIndex(null);
  };

  return (
    <View style={styles.root}>

      {/* ── Graphique ───────────────────────────────────────────────────── */}
      <DiveProfileSvg segments={segments} />

      {/* ── Liste des segments ───────────────────────────────────────────── */}
      <SegmentList
        segments={segments}
        gazFondList={gazFondList}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      {/* ── Formulaire (bottom sheet) ────────────────────────────────────── */}
      <SegmentFormSheet
        visible={sheetVisible}
        segment={editingSegment}
        gazFondList={gazFondList}
        isAdding={editingIndex === null}
        onSave={handleSave}
        onClose={handleClose}
      />

    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DiveProfileSvg — visualisation uniquement
// ─────────────────────────────────────────────────────────────────────────────

const SVG_W = 300;
const SVG_H = 160;
const PAD = { l: 32, r: 10, t: 10, b: 22 };
const PW = SVG_W - PAD.l - PAD.r;
const PH = SVG_H - PAD.t - PAD.b;

function DiveProfileSvg({ segments }: { segments: Segment[] }) {
  if (segments.length === 0) {
    return (
      <View style={styles.svgEmpty}>
        <MaterialIcons name="show-chart" size={28} color={ocean.border.subtle} />
        <Text style={styles.svgEmptyTxt}>Le profil s'affiche ici</Text>
      </View>
    );
  }

  const maxDepth = Math.max(...segments.flatMap(s => [s.startDepth, s.endDepth]), 10);
  const totalTime = segments.reduce((s, seg) => s + seg.time, 0) || 1;

  // Normalisation
  const tx = (t: number) => PAD.l + (t / totalTime) * PW;
  const ty = (d: number) => PAD.t + (d / (maxDepth * 1.1)) * PH;

  // Construction des points du profil (depuis la surface)
  const points: { x: number; y: number }[] = [{ x: tx(0), y: ty(0) }];
  let cursor = 0;
  for (const seg of segments) {
    cursor += seg.time;
    points.push({ x: tx(cursor), y: ty(seg.endDepth) });
  }
  // Remontée finale à la surface si le dernier segment ne l'est pas
  if (segments[segments.length - 1]?.endDepth !== 0) {
    points.push({ x: tx(totalTime), y: ty(0) });
  }

  const polyPoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  // Chemin de remplissage (ferme sous la courbe)
  const fillPath = [
    `M ${tx(0).toFixed(1)} ${ty(0).toFixed(1)}`,
    ...points.slice(1).map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`),
    `L ${tx(totalTime).toFixed(1)} ${ty(0).toFixed(1)}`,
    'Z',
  ].join(' ');

  // Graduations profondeur (tous les 10m)
  const depthStep = maxDepth <= 20 ? 5 : 10;
  const depthTicks = Array.from(
    { length: Math.floor((maxDepth * 1.1) / depthStep) + 1 },
    (_, i) => i * depthStep,
  );

  // Graduations temps (tous les 5 ou 10 min)
  const timeStep = totalTime <= 20 ? 5 : 10;
  const timeTicks = Array.from(
    { length: Math.floor(totalTime / timeStep) },
    (_, i) => (i + 1) * timeStep,
  );

  return (
    <View style={styles.svgWrapper}>
      <Svg width="100%" height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
        <Defs>
          <LinearGradient id="profileFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={ocean.accent.blue} stopOpacity="0.25" />
            <Stop offset="1" stopColor={ocean.accent.blue} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>

        {/* Grille horizontale (profondeurs) */}
        {depthTicks.map(d => (
          <React.Fragment key={`dg${d}`}>
            <Line
              x1={PAD.l} y1={ty(d)} x2={PAD.l + PW} y2={ty(d)}
              stroke="rgba(255,255,255,0.07)" strokeWidth={0.5}
            />
            <SvgText
              x={PAD.l - 4} y={ty(d) + 3.5}
              textAnchor="end" fontSize={8} fill={ocean.text.muted}
            >{d}m</SvgText>
          </React.Fragment>
        ))}

        {/* Grille verticale (temps) */}
        {timeTicks.map(t => (
          <React.Fragment key={`tg${t}`}>
            <Line
              x1={tx(t)} y1={PAD.t} x2={tx(t)} y2={PAD.t + PH}
              stroke="rgba(255,255,255,0.05)" strokeWidth={0.5}
            />
            <SvgText
              x={tx(t)} y={SVG_H - 5}
              textAnchor="middle" fontSize={8} fill={ocean.text.muted}
            >{t}'</SvgText>
          </React.Fragment>
        ))}

        {/* Ligne de surface */}
        <Line
          x1={PAD.l} y1={ty(0)} x2={PAD.l + PW} y2={ty(0)}
          stroke="rgba(255,255,255,0.15)" strokeWidth={0.5}
        />

        {/* Remplissage sous le profil */}
        <Path d={fillPath} fill="url(#profileFill)" />

        {/* Courbe du profil */}
        <Polyline
          points={polyPoints}
          fill="none"
          stroke={ocean.accent.blue}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SegmentList — liste avec edit / delete
// ─────────────────────────────────────────────────────────────────────────────

type SegmentListProps = {
  segments: Segment[];
  gazFondList: Gas[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onAdd: () => void;
};

function SegmentList({ segments, gazFondList, onEdit, onDelete, onAdd }: SegmentListProps) {
  const gazName = (name: string) =>
    gazFondList.find(g => g.name === name)?.name ?? name;

  const segmentLabel = (seg: Segment) => {
    if (seg.startDepth === seg.endDepth) return `Palier ${seg.startDepth} m`;
    if (seg.endDepth > seg.startDepth) return `Descente → ${seg.endDepth} m`;
    return `Remontée → ${seg.endDepth} m`;
  };

  return (
    <View style={styles.listContainer}>

      {/* En-tête */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Segments</Text>
        <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.8}>
          <MaterialIcons name="add" size={16} color={ocean.bg.deep} />
          <Text style={styles.addBtnTxt}>Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* État vide */}
      {segments.length === 0 && (
        <View style={styles.listEmpty}>
          <Text style={styles.listEmptyTxt}>
            Aucun segment — appuyez sur "Ajouter" pour décrire le profil.
          </Text>
        </View>
      )}

      {/* Lignes */}
      {segments.map((seg, i) => (
        <View key={i} style={styles.segRow}>

          {/* Indicateur de type */}
          <View style={[styles.segTypeIndicator, segTypeColor(seg)]} />

          {/* Infos */}
          <View style={styles.segInfo}>
            <Text style={styles.segLabel}>{segmentLabel(seg)}</Text>
            <View style={styles.segMeta}>
              <Text style={styles.segMetaTxt}>{seg.time} min</Text>
              {seg.gasName !== '' && (
                <>
                  <Text style={styles.segMetaDot}>·</Text>
                  <Text style={styles.segMetaTxt}>{gazName(seg.gasName)}</Text>
                </>
              )}
              {seg.startDepth !== seg.endDepth && (
                <>
                  <Text style={styles.segMetaDot}>·</Text>
                  <Text style={styles.segMetaTxt}>{seg.startDepth}→{seg.endDepth} m</Text>
                </>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.segActions}>
            <TouchableOpacity
              style={styles.segActionBtn}
              onPress={() => onEdit(i)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="edit" size={16} color={ocean.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segActionBtn, styles.segActionBtnDelete]}
              onPress={() => onDelete(i)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons name="delete" size={16} color={ocean.accent.red} />
            </TouchableOpacity>
          </View>

        </View>
      ))}

    </View>
  );
}

function segTypeColor(seg: Segment) {
  if (seg.endDepth > seg.startDepth) return { backgroundColor: ocean.accent.blue };
  if (seg.endDepth < seg.startDepth) return { backgroundColor: ocean.accent.teal };
  return { backgroundColor: ocean.accent.amber };   // palier
}

// ─────────────────────────────────────────────────────────────────────────────
// SegmentFormSheet — bottom sheet add / edit
// ─────────────────────────────────────────────────────────────────────────────

type SheetProps = {
  visible: boolean;
  segment: Segment | null;   // null = mode ajout
  gazFondList: Gas[];
  isAdding: boolean;
  onSave: (seg: Segment) => void;
  onClose: () => void;
};

function SegmentFormSheet({ visible, segment, gazFondList, isAdding, onSave, onClose }: SheetProps) {
  const [startDepth, setStartDepth] = useState('');
  const [endDepth, setEndDepth] = useState('');
  const [time, setTime] = useState('');
  const [gasName, setGasName] = useState('');
  const [error, setError] = useState('');

  // Remplissage à l'ouverture
  React.useEffect(() => {
    if (visible) {
      setStartDepth(segment ? String(segment.startDepth) : '');
      setEndDepth(segment ? String(segment.endDepth) : '');
      setTime(segment ? String(segment.time) : '');
      setGasName(segment ? segment.gasName : gazFondList[0]?.name ?? '');
      setError('');
    }
  }, [visible, segment]);

  const handleSave = () => {
    const sd = parseFloat(startDepth);
    const ed = parseFloat(endDepth);
    const t = parseFloat(time);

    if (isNaN(sd) || sd < 0) { setError('Profondeur de début invalide.'); return; }
    if (isNaN(ed) || ed < 0) { setError('Profondeur de fin invalide.'); return; }
    if (isNaN(t) || t <= 0) { setError('Durée invalide (> 0 min).'); return; }
    if (!gasName && gazFondList.length > 0) { setError('Sélectionnez un gaz.'); return; }

    setError('');
    Keyboard.dismiss();
    onSave({ startDepth: sd, endDepth: ed, time: t, gasName });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Fond semi-transparent */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>

          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Titre */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {isAdding ? 'Ajouter un segment' : 'Modifier le segment'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialIcons name="close" size={20} color={ocean.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.sheetContent}
            keyboardShouldPersistTaps="handled"
          >

            {/* Ligne profondeurs */}
            <View style={styles.sheetRow}>
              <View style={styles.sheetField}>
                <Text style={styles.sheetLabel}>Prof. début (m)</Text>
                <TextInput
                  style={styles.sheetInput}
                  value={startDepth}
                  onChangeText={setStartDepth}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={ocean.text.muted}
                  selectTextOnFocus
                />
              </View>
              <MaterialIcons
                name="arrow-forward"
                size={16}
                color={ocean.text.muted}
                style={{ marginTop: 24 }}
              />
              <View style={styles.sheetField}>
                <Text style={styles.sheetLabel}>Prof. fin (m)</Text>
                <TextInput
                  style={styles.sheetInput}
                  value={endDepth}
                  onChangeText={setEndDepth}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor={ocean.text.muted}
                  selectTextOnFocus
                />
              </View>
            </View>

            {/* Durée */}
            <View style={styles.sheetField}>
              <Text style={styles.sheetLabel}>Durée (min)</Text>
              <TextInput
                style={styles.sheetInput}
                value={time}
                onChangeText={setTime}
                keyboardType="numeric"
                placeholder="20"
                placeholderTextColor={ocean.text.muted}
                selectTextOnFocus
              />
            </View>

            {/* Sélection du gaz — chips simples */}
            {gazFondList.length > 0 && (
              <View>
                <Text style={styles.sheetLabel}>Gaz</Text>
                <View style={styles.gasChips}>
                  {gazFondList.map(g => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.gasChip, gasName === g.name && styles.gasChipActive]}
                      onPress={() => setGasName(g.name)}
                    >
                      <Text style={[styles.gasChipTxt, gasName === g.name && styles.gasChipTxtActive]}>
                        {g.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Aperçu du type de segment */}
            {!isNaN(parseFloat(startDepth)) && !isNaN(parseFloat(endDepth)) && (
              <View style={styles.segPreview}>
                <Text style={styles.segPreviewTxt}>
                  {parseFloat(endDepth) > parseFloat(startDepth) ? '↓ Descente'
                    : parseFloat(endDepth) < parseFloat(startDepth) ? '↑ Remontée'
                      : '— Palier'}
                </Text>
              </View>
            )}

            {/* Erreur */}
            {error !== '' && (
              <Text style={styles.errorTxt}>{error}</Text>
            )}

          </ScrollView>

          {/* Bouton valider */}
          <View style={styles.sheetFooter}>
            <TouchableOpacity style={styles.sheetCancelBtn} onPress={onClose}>
              <Text style={styles.sheetCancelTxt}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetSaveBtn} onPress={handleSave} activeOpacity={0.85}>
              <MaterialIcons name={isAdding ? 'add' : 'check'} size={18} color={ocean.bg.deep} />
              <Text style={styles.sheetSaveTxt}>{isAdding ? 'Ajouter' : 'Enregistrer'}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { gap: spacing.sm },

  // ── SVG ──────────────────────────────────────────────────────────────────
  svgWrapper: {
    backgroundColor: ocean.bg.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ocean.border.subtle,
    overflow: 'hidden',
    paddingVertical: spacing.xs,
  },
  svgEmpty: {
    height: SVG_H,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  svgEmptyTxt: { fontSize: fontSize.sm, color: ocean.text.muted },

  // ── Liste ─────────────────────────────────────────────────────────────────
  listContainer: {
    backgroundColor: ocean.bg.surface,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: ocean.border.subtle,
    overflow: 'hidden',
  },
  listHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ocean.border.subtle,
  },
  listTitle: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.secondary },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: ocean.accent.green, borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: 4,
  },
  addBtnTxt: { fontSize: fontSize.xs, fontWeight: '600', color: ocean.bg.deep },

  listEmpty: { padding: spacing.md },
  listEmptyTxt: { fontSize: fontSize.sm, color: ocean.text.muted, fontStyle: 'italic' },

  segRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ocean.border.subtle,
    gap: spacing.sm,
  },
  segTypeIndicator: { width: 3, height: 36, borderRadius: 2 },
  segInfo: { flex: 1 },
  segLabel: { fontSize: fontSize.sm, fontWeight: '500', color: ocean.text.primary },
  segMeta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  segMetaTxt: { fontSize: fontSize.xs, color: ocean.text.muted },
  segMetaDot: { fontSize: fontSize.xs, color: ocean.border.subtle },

  segActions: { flexDirection: 'row', gap: spacing.xs },
  segActionBtn: {
    width: 30, height: 30, borderRadius: radius.sm,
    backgroundColor: ocean.bg.raised, alignItems: 'center', justifyContent: 'center',
  },
  segActionBtnDelete: { backgroundColor: ocean.soft.red },

  // ── Bottom sheet ──────────────────────────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheetWrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  sheet: {
    backgroundColor: ocean.bg.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderTopWidth: 0.5, borderColor: ocean.border.subtle,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  sheetHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: ocean.border.muted,
    alignSelf: 'center', marginTop: 10, marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: ocean.border.subtle,
  },
  sheetTitle: { fontSize: fontSize.md, fontWeight: '500', color: ocean.text.primary },
  sheetContent: { padding: spacing.md, gap: spacing.sm },

  sheetRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  sheetField: { flex: 1, gap: 4 },
  sheetLabel: { fontSize: fontSize.xs, fontWeight: '500', color: ocean.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  sheetInput: {
    backgroundColor: ocean.bg.raised,
    borderWidth: StyleSheet.hairlineWidth, borderColor: ocean.border.subtle,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
    fontSize: fontSize.md, color: ocean.text.primary,
  },

  gasChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 4 },
  gasChip: {
    paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.full,
    backgroundColor: ocean.bg.raised,
    borderWidth: 0.5, borderColor: ocean.border.subtle,
  },
  gasChipActive: { backgroundColor: ocean.soft.blue, borderColor: ocean.accent.blue },
  gasChipTxt: { fontSize: fontSize.sm, color: ocean.text.secondary },
  gasChipTxtActive: { color: ocean.accent.blue, fontWeight: '500' },

  segPreview: {
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    backgroundColor: ocean.bg.raised, borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  segPreviewTxt: { fontSize: fontSize.xs, color: ocean.text.muted },

  errorTxt: { fontSize: fontSize.sm, color: ocean.accent.red },

  sheetFooter: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: ocean.border.subtle,
  },
  sheetCancelBtn: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: ocean.bg.raised,
    borderWidth: 0.5, borderColor: ocean.border.subtle,
  },
  sheetCancelTxt: { fontSize: fontSize.sm, color: ocean.text.secondary },
  sheetSaveBtn: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingVertical: spacing.sm,
    borderRadius: radius.md, backgroundColor: ocean.accent.green,
  },
  sheetSaveTxt: { fontSize: fontSize.sm, fontWeight: '600', color: ocean.bg.deep },
});
