/**
 * sopGenerator.ts — SOP 自动生成器（六体系分析）
 * 基于太一万有理论《白皮书》步骤 0-7 完整模板
 *
 * 四个预设场景：
 * 1. superconductor（超导配对）
 * 2. consensus（社区共识）
 * 3. qualia（视觉意识）
 * 4. cmb_cold_spot（CMB 冷斑）
 */

/** SOP 预设类型 */
export type SOPPreset = 'superconductor' | 'consensus' | 'qualia' | 'cmb_cold_spot' | 'custom';

/** Step 0: 现象锚定 */
export interface SOPStep0 {
  h1: string;
  h2: string;
  h3: string;
}

/** Step 1: 金灵球赋参 */
export interface SOPStep1 {
  V: string;
  E_potential: string;
  rho0: string;
  w0: string;
  theta0: string;
  phi_est: string;
  pg_rule_id: string;
}

/** Step 2: FT/E L 时间方向 */
export interface SOPStep2 {
  ftel_forward: string;
  ftel_reverse: string;
  bidir_balanced: boolean;
  t_bidir: boolean;
}

/** Step 3: PG 判定 */
export interface SOPStep3 {
  pg_type: 'Dispersed Background' | 'Confined Soliton (Mass-Face)' | 'Rupert-Tear';
  boundary_leak: string;
}

/** Step 4: 候选结构与优胜 */
export interface SOPStep4Candidate {
  name: string;
  M: string;
  H: string;
  penalty: string;
  s_rel: string;
}

export interface SOPStep4 {
  candidates: SOPStep4Candidate[];
  winner: string;
}

/** Step 5: 锁相判定 */
export interface SOPStep5 {
  locked: boolean;
  lock_condition: string;
  break_factors: string;
}

/** Step 6: 数值验收 */
export interface SOPStep6 {
  mass_face: string;
  excess_loop_hold: string;
  boundary_leak: string;
  pass: boolean;
}

/** Step 7: 三视角结论 */
export interface SOPStep7 {
  core_view: string;
  spirit_view: string;
  material_view: string;
  conclusion: string;
  intervention: string;
}

/** 完整 SOP 报告 */
export interface SOPReport {
  phenomenon: string;
  date: string;
  analyst: string;
  step0: SOPStep0;
  step1: SOPStep1;
  step2: SOPStep2;
  step3: SOPStep3;
  step4: SOPStep4;
  step5: SOPStep5;
  step6: SOPStep6;
  step7: SOPStep7;
}

/** 超导预设 */
const SUPERCONDUCTOR_REPORT: SOPReport = {
  phenomenon: '低温下金属电阻突降至零（超导态）',
  date: new Date().toISOString().split('T')[0],
  analyst: 'TMK-SOP-Auto',
  step0: {
    h1: 'I‑V曲线呈零电阻平台；Meissner效应；Josephson干涉',
    h2: 'BCS理论（声子媒介Cooper对；能隙Δ）',
    h3: 'Cooper对 = 金灵球Rel边耦合增强；能隙Δ = PG囚禁深度（Mass-Face precursor）',
  },
  step1: {
    V: '电子金灵球 𝒢_e（自旋↑/↓成对）',
    E_potential: '声子媒介虚拟Rel边（吸引势）',
    rho0: '≈0.08',
    w0: '≈0.3（声子耦合λ_ph）',
    theta0: 'Δφ≈0（锁相）',
    phi_est: '≈0.95（充足）',
    pg_rule_id: 'PG-SC-001',
  },
  step2: {
    ftel_forward: '降温→声子吸引增强→Cooper对形成→零电阻',
    ftel_reverse: '升温→热涨落破坏配对→正常电阻',
    bidir_balanced: false,
    t_bidir: false,
  },
  step3: {
    pg_type: 'Confined Soliton (Mass-Face)',
    boundary_leak: '≈0.12',
  },
  step4: {
    candidates: [
      { name: 'Cooper配对态', M: '0.82', H: '0.15', penalty: '0.03', s_rel: '0.94' },
      { name: '正常费米液态', M: '0.45', H: '0.55', penalty: '0.10', s_rel: '0.40' },
    ],
    winner: 'Cooper配对态',
  },
  step5: {
    locked: true,
    lock_condition: 'T < T_c 且 B < B_c → Δφ≈0 锁相条件满足',
    break_factors: 'T↑超过T_c / B↑超过B_c / 杂质散射',
  },
  step6: {
    mass_face: '>0.8',
    excess_loop_hold: '>0.5',
    boundary_leak: '≈0.12',
    pass: true,
  },
  step7: {
    core_view: '相空间中MASS_FACE>0.8，拓扑流形闭合为囚禁态，Cooper对在Rel-Sphere上形成紧致闭环',
    spirit_view: '太一意义上，阴阳配对（自旋↑↓）达成和合，在消解端口形成完美对称，体现"太极生两仪"的微观投射',
    material_view: '宏观零电阻 = 微观电子对在声子海中无损耗传播，Meissner效应 = Rel-Sphere闭合排斥外磁通',
    conclusion: '超导态是TMK框架下典型的Confined Soliton态，Mass-Face超过阈值触发HEX_RING_GAP囚禁',
    intervention: '↑Φ_inj（降温）／↑w（同位素置换）／对齐θ（屏蔽磁场）',
  },
};

/** 共识预设 */
const CONSENSUS_REPORT: SOPReport = {
  phenomenon: '社区议事会从分歧→一致决议',
  date: new Date().toISOString().split('T')[0],
  analyst: 'TMK-SOP-Auto',
  step0: {
    h1: '投票记录12:3→15:0',
    h2: '社会网络理论（阈值模型）',
    h3: '共识=ρ_Rel>ρ_c（关系边密度跨阈）',
  },
  step1: {
    V: '议事成员金灵球 𝒢_m（偏好编码于phase）',
    E_potential: '讨论/说服Rel边（信任权重w）',
    rho0: '0.45',
    w0: '0.3→0.7（讨论深化）',
    theta0: '初始分散→逐步对齐',
    phi_est: '≈0.75（中等）',
    pg_rule_id: 'PG-CO-001',
  },
  step2: {
    ftel_forward: '持续讨论→信任增强→偏好对齐→共识达成',
    ftel_reverse: '外部扰动→信任削弱→偏好分化→共识瓦解',
    bidir_balanced: true,
    t_bidir: true,
  },
  step3: {
    pg_type: 'Rupert-Tear',
    boundary_leak: '≈0.16',
  },
  step4: {
    candidates: [
      { name: '共识态(ρ>ρ_c)', M: '0.78', H: '0.22', penalty: '0.05', s_rel: '0.73' },
      { name: '分裂态(ρ<ρ_c)', M: '0.35', H: '0.65', penalty: '0.15', s_rel: '0.20' },
    ],
    winner: '共识态(ρ>ρ_c)',
  },
  step5: {
    locked: true,
    lock_condition: 'ρ>ρ_c=0.7 且 T_bidir秩=2（双向议事规则）',
    break_factors: '关键成员退出/外部信息冲击/议程操控',
  },
  step6: {
    mass_face: '0.82',
    excess_loop_hold: '0.35',
    boundary_leak: '≈0.16',
    pass: true,
  },
  step7: {
    core_view: 'ρ从0.45跃迁至0.82>ρ_c=0.7，Rel-Sphere边密度突破临界值，形成鲁珀特之泪结构',
    spirit_view: '太一意义上，众人意见从散乱到和合，体现了"和而不同"→"同声相应"的群体意识涌现',
    material_view: '投票记录从12:3转变为15:0，社会网络从松散到紧密连通，信息传递效率倍增',
    conclusion: '社区共识是TMK框架下Rupert-Tear型相变，关系边密度跨阈后拓扑刚性涌现',
    intervention: '↑ρ（建桥接边）／↑w（信任/Hebbian强化）／对齐θ（双向议事规则T_bidir秩=2）',
  },
};

/** 意识预设 */
const QUALIA_REPORT: SOPReport = {
  phenomenon: '双眼接收刺激→主观红色感出现',
  date: new Date().toISOString().split('T')[0],
  analyst: 'TMK-SOP-Auto',
  step0: {
    h1: 'fMRI BOLD广泛γ(30-80Hz)同步',
    h2: 'GNW/IIT理论',
    h3: '意识=Rel_Sph(CY₆)微激活+L₄自指闭环',
  },
  step1: {
    V: '视觉皮层金灵球 𝒢_v（特征编码于phase/chi）',
    E_potential: '突触Rel边（γ同步耦合w≈0.4→0.8）',
    rho0: '0.3',
    w0: '0.4→0.8（注意增强）',
    theta0: '初始异步→γ同步对齐',
    phi_est: '≈0.6',
    pg_rule_id: 'PG-QA-001',
  },
  step2: {
    ftel_forward: '刺激→特征绑定→γ同步→全局广播→意识体验',
    ftel_reverse: '麻醉→同步瓦解→信息孤岛→意识消失',
    bidir_balanced: true,
    t_bidir: true,
  },
  step3: {
    pg_type: 'Confined Soliton (Mass-Face)',
    boundary_leak: '≈0.164',
  },
  step4: {
    candidates: [
      { name: '意识态(Rel_Sph激活)', M: '0.70', H: '0.30', penalty: '0.08', s_rel: '0.62' },
      { name: '无意识态(局部处理)', M: '0.25', H: '0.75', penalty: '0.20', s_rel: '0.05' },
    ],
    winner: '意识态(Rel_Sph激活)',
  },
  step5: {
    locked: false,
    lock_condition: 'Rel_Sph(CY₆)持续激活且L₄自指闭环运行',
    break_factors: '麻醉/TMS干扰/睡眠/注意转移',
  },
  step6: {
    mass_face: '0.65',
    excess_loop_hold: '0.15',
    boundary_leak: '≈0.164',
    pass: true,
  },
  step7: {
    core_view: '视觉皮层Rel_Sph(CY₆)被激活，L₄自指闭环形成，MASS_FACE在临界值附近，BOUNDARY_LEAK≈0.164',
    spirit_view: '太一意义上，主观体验是"心物一元"的投射——观察者与被观察者在L₄自指中合一',
    material_view: 'γ同步 = Rel-Sphere上相位锁定；主观红色 = CY₆微激活的全局广播结果',
    conclusion: '意识是TMK框架下BOUNDARY_LEAK≈0.164的临界现象，Rel_Sph微激活+L₄自指闭环共同构成意识涌现的充要条件',
    intervention: '↑ρ（注意增强）／↑w（γ同步刺激）／维持BOUNDARY_LEAK≈0.164（意识临界窗）',
  },
};

/** CMB 冷斑预设 */
const CMB_COLD_SPOT_REPORT: SOPReport = {
  phenomenon: 'WMAP/Planck CMB冷斑（~5σ异常）',
  date: new Date().toISOString().split('T')[0],
  analyst: 'TMK-SOP-Auto',
  step0: {
    h1: 'CMB T-map圆形低温区',
    h2: 'ΛCDM（宇宙学常数+冷暗物质）',
    h3: '冷斑=早期Rel_Sph投影PDS（庞加莱十二面体空间）',
  },
  step1: {
    V: '宇宙学尺度金灵球 𝒢_cosmo（CMB温度涨落编码）',
    E_potential: '引力Rel边（大尺度结构关联）',
    rho0: '≈0.02（极稀疏）',
    w0: '≈0.1（弱引力耦合）',
    theta0: '初始量子涨落相位',
    phi_est: '≈0.4（不确定性大）',
    pg_rule_id: 'PG-CMB-001',
  },
  step2: {
    ftel_forward: '庞加莱投影→匹配圆→PDS拓扑→冷斑形成',
    ftel_reverse: '统计涨落→随机冷斑→非拓扑起源',
    bidir_balanced: false,
    t_bidir: false,
  },
  step3: {
    pg_type: 'Confined Soliton (Mass-Face)',
    boundary_leak: '≈0.15',
  },
  step4: {
    candidates: [
      { name: 'PDS投影假说', M: '0.60', H: '0.40', penalty: '0.10', s_rel: '0.50' },
      { name: '纯统计涨落', M: '0.30', H: '0.70', penalty: '0.05', s_rel: '0.25' },
      { name: 'ISW效应增强', M: '0.45', H: '0.55', penalty: '0.08', s_rel: '0.37' },
    ],
    winner: 'PDS投影假说',
  },
  step5: {
    locked: false,
    lock_condition: '若LiteBIRD确认6对匹配圆（相位差36°）→PDS拓扑锁定',
    break_factors: '匹配圆不出现/相位差不符/系统误差',
  },
  step6: {
    mass_face: '0.55',
    excess_loop_hold: '0.20',
    boundary_leak: '≈0.15',
    pass: false,
  },
  step7: {
    core_view: 'CMB冷斑在TMK框架下对应Rel_Sph的PDS投影，若庞加莱十二面体空间假说成立，则应观测到6对匹配圆',
    spirit_view: '太一意义上，宇宙最大尺度的拓扑映照了最小尺度的量子闭域——"其大无外，其小无内"',
    material_view: 'LiteBIRD应观测6对匹配圆（相位差36°）→P₂预言，这是PDS假说的关键可证伪预测',
    conclusion: 'CMB冷斑的TMK分析指向PDS投影，但尚需LiteBIRD观测验证。当前MASS_FACE未完全通过验收',
    intervention: '等待LiteBIRD数据验证6对匹配圆／改进CMB去卷积算法／分析冷斑周边拓扑特征',
  },
};

/** 预设映射 */
const PRESET_MAP: Record<string, SOPReport> = {
  superconductor: SUPERCONDUCTOR_REPORT,
  consensus: CONSENSUS_REPORT,
  qualia: QUALIA_REPORT,
  cmb_cold_spot: CMB_COLD_SPOT_REPORT,
};

/**
 * 生成 SOP 报告
 *
 * @param preset 预设类型
 * @param customPhenomenon 自定义现象描述（仅 custom 模式）
 */
export function generateSOPReport(preset: SOPPreset, customPhenomenon?: string): SOPReport {
  if (preset === 'custom') {
    return {
      phenomenon: customPhenomenon || '未指定现象',
      date: new Date().toISOString().split('T')[0],
      analyst: 'TMK-SOP-Custom',
      step0: {
        h1: '待填写：可观测现象描述',
        h2: '待填写：现有理论解释',
        h3: '待填写：TMK假说映射',
      },
      step1: {
        V: '待填写：金灵球集合',
        E_potential: '待填写：潜在Rel边',
        rho0: '待填写',
        w0: '待填写',
        theta0: '待填写',
        phi_est: '待填写',
        pg_rule_id: 'PG-CUSTOM-000',
      },
      step2: {
        ftel_forward: '待填写',
        ftel_reverse: '待填写',
        bidir_balanced: false,
        t_bidir: false,
      },
      step3: {
        pg_type: 'Dispersed Background',
        boundary_leak: '待测量',
      },
      step4: {
        candidates: [
          { name: '候选A', M: '-', H: '-', penalty: '-', s_rel: '-' },
        ],
        winner: '待判定',
      },
      step5: {
        locked: false,
        lock_condition: '待判定',
        break_factors: '待分析',
      },
      step6: {
        mass_face: '待计算',
        excess_loop_hold: '待计算',
        boundary_leak: '待计算',
        pass: false,
      },
      step7: {
        core_view: '待填写',
        spirit_view: '待填写',
        material_view: '待填写',
        conclusion: '待总结',
        intervention: '待建议',
      },
    };
  }

  return { ...PRESET_MAP[preset] };
}

/**
 * 将 SOP 报告渲染为 Markdown 文本
 */
export function renderSOPMarkdown(report: SOPReport): string {
  const lines: string[] = [
    `# TMK-SOP 六体系分析报告`,
    ``,
    `**现象**: ${report.phenomenon}`,
    `**日期**: ${report.date}`,
    `**分析者**: ${report.analyst}`,
    ``,
    `---`,
    ``,
    `## Step 0: 现象锚定`,
    ``,
    `| 层级 | 描述 |`,
    `|------|------|`,
    `| H₁ (可观测) | ${report.step0.h1} |`,
    `| H₂ (理论) | ${report.step0.h2} |`,
    `| H₃ (TMK) | ${report.step0.h3} |`,
    ``,
    `## Step 1: 金灵球赋参`,
    ``,
    `| 参数 | 值 |`,
    `|------|-----|`,
    `| V (球集) | ${report.step1.V} |`,
    `| E (潜在边) | ${report.step1.E_potential} |`,
    `| ρ₀ | ${report.step1.rho0} |`,
    `| w₀ | ${report.step1.w0} |`,
    `| θ₀ | ${report.step1.theta0} |`,
    `| φ_est | ${report.step1.phi_est} |`,
    `| PG Rule | ${report.step1.pg_rule_id} |`,
    ``,
    `## Step 2: FT/EL 时间方向`,
    ``,
    `| 方向 | 描述 |`,
    `|------|------|`,
    `| FT/EL → | ${report.step2.ftel_forward} |`,
    `| FT/EL ← | ${report.step2.ftel_reverse} |`,
    `| 双向平衡 | ${report.step2.bidir_balanced ? '是' : '否'} |`,
    `| T_bidir | ${report.step2.t_bidir ? '是' : '否'} |`,
    ``,
    `## Step 3: PG 判定`,
    ``,
    `- **PG 类型**: ${report.step3.pg_type}`,
    `- **BOUNDARY_LEAK**: ${report.step3.boundary_leak}`,
    ``,
    `## Step 4: 候选结构与优胜`,
    ``,
    `| 候选 | M | H | Penalty | S_rel |`,
    `|------|---|---|---------|-------|`,
    ...report.step4.candidates.map(c =>
      `| ${c.name} | ${c.M} | ${c.H} | ${c.penalty} | ${c.s_rel} |`
    ),
    ``,
    `**优胜者**: ${report.step4.winner}`,
    ``,
    `## Step 5: 锁相判定`,
    ``,
    `- **已锁定**: ${report.step5.locked ? '是' : '否'}`,
    `- **锁定条件**: ${report.step5.lock_condition}`,
    `- **破坏因素**: ${report.step5.break_factors}`,
    ``,
    `## Step 6: 数值验收`,
    ``,
    `| 指标 | 值 |`,
    `|------|-----|`,
    `| MASS_FACE | ${report.step6.mass_face} |`,
    `| EXCESS_LOOP_HOLD | ${report.step6.excess_loop_hold} |`,
    `| BOUNDARY_LEAK | ${report.step6.boundary_leak} |`,
    `| **通过** | ${report.step6.pass ? '✅ 是' : '❌ 否'} |`,
    ``,
    `## Step 7: 三视角结论`,
    ``,
    `### 核心视角`,
    report.step7.core_view,
    ``,
    `### 灵性视角`,
    report.step7.spirit_view,
    ``,
    `### 物质视角`,
    report.step7.material_view,
    ``,
    `### 结论`,
    report.step7.conclusion,
    ``,
    `### 干预建议`,
    report.step7.intervention,
    ``,
    `---`,
    `*由 TMK-SOP 自动生成器生成*`,
  ];

  return lines.join('\n');
}
