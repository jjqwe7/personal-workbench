/**
 * 内容渲染器 - 个人工作台
 * 使用 ContentData 全局对象渲染3个新页面
 */
(function () {
  'use strict';

  // =============================================================
  // 1. 皮肤战略详情页
  // =============================================================
  window.renderSkinStrategy = function renderSkinStrategy() {
    const content = document.getElementById('app-content');
    const data = ContentData.skinStrategy;

    content.innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('skincare')">&#8592; 返回</button>
          <h2>${escapeHtml(data.title)}</h2>
          <span></span>
        </div>
        <p class="page-subtitle">${escapeHtml(data.subtitle)}</p>

        <!-- 1. 个人档案 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128100; 个人档案</span></div>
          <table class="info-table">
            <tr><td>肤质</td><td>${escapeHtml(data.profile.skinType)}</td></tr>
            <tr><td>年龄</td><td>${escapeHtml(data.profile.age)}</td></tr>
            <tr><td>问题</td><td>${escapeHtml(data.profile.problem)}</td></tr>
            <tr><td>预算</td><td>${escapeHtml(data.profile.budget)}</td></tr>
          </table>
        </div>

        <!-- 2. 皮肤诊断结果 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128300; 皮肤诊断结果</span></div>
          <table class="info-table">
            <tr><td>肤质类型</td><td>${escapeHtml(data.diagnosis.skinType)}</td></tr>
            <tr><td>敏感度</td><td>${escapeHtml(data.diagnosis.sensitivity)}</td></tr>
            <tr><td>核心问题</td><td>${escapeHtml(data.diagnosis.coreProblem)}</td></tr>
            <tr><td>痘印类型</td><td>${escapeHtml(data.diagnosis.scarType)}</td></tr>
            <tr><td>凹陷性瘢痕</td><td>${escapeHtml(data.diagnosis.pit)}</td></tr>
            <tr><td>活跃期判断</td><td>${escapeHtml(data.diagnosis.activePhase)}</td></tr>
          </table>
          <div class="tip-box" style="margin-top:12px;background:rgba(157,174,148,0.1);border-radius:10px;padding:14px 16px;border-left:3px solid #9DAE94;font-size:0.85rem;color:#5A5650;">
            <strong>核心判断：</strong>${escapeHtml(data.diagnosis.keyJudgment)}
          </div>
        </div>

        <!-- 3. 三阶段作战地图 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128198; 三阶段作战地图</span></div>
          <div class="phase-cards">
            ${data.phases.map(p => `
              <div class="phase-card" style="background:#fff;border:1px solid #EBE7E2;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(74,70,66,0.05);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <span style="font-weight:600;color:#4A4642;font-size:1rem;">${escapeHtml(p.name)}</span>
                  <span class="tag tag-study">${escapeHtml(p.period)}</span>
                </div>
                <p style="font-size:0.9rem;color:#5A5650;margin-bottom:8px;">${escapeHtml(p.coreGoal)}</p>
                <div style="font-size:0.85rem;color:#7A8B73;background:rgba(157,174,148,0.08);padding:10px 12px;border-radius:8px;margin-bottom:6px;">
                  <strong>升级条件：</strong>${escapeHtml(p.upgradeCondition)}
                </div>
                ${p.note ? `<div style="font-size:0.8rem;color:#918B83;padding:6px 0 0;">${escapeHtml(p.note)}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 4. 产品审计结果 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128722; 产品审计结果</span></div>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:480px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">产品</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">类型</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">处理</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">理由</th>
                </tr>
              </thead>
              <tbody>
                ${data.products.map(p => `
                  <tr>
                    <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(p.name)}</td>
                    <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(p.type)}</td>
                    <td style="padding:6px 10px;font-size:0.85rem;"><span class="tag ${p.disposal === '丢弃' ? 'tag-skin-condition' : p.disposal === '保留' ? 'tag-study' : p.disposal === '暂停' ? 'tag-progress' : 'tag-clickable'}">${escapeHtml(p.disposal)}</span></td>
                    <td style="padding:6px 10px;font-size:0.85rem;color:#5A5650;">${escapeHtml(p.reason)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 5. 采购清单 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128179; 采购清单</span></div>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:480px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">分类</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">推荐</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">价格</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">优先级</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">备注</th>
                </tr>
              </thead>
              <tbody>
                ${data.shoppingList.map(item => `
                  <tr>
                    <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(item.category)}</td>
                    <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(item.recommended)}</td>
                    <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(item.price)}</td>
                    <td style="padding:6px 10px;font-size:0.85rem;"><span class="tag ${item.priority === '必买' ? 'tag-study' : item.priority === '强烈建议' ? 'tag-progress' : 'tag-clickable'}">${escapeHtml(item.priority)}</span></td>
                    <td style="padding:6px 10px;font-size:0.85rem;color:#5A5650;">${escapeHtml(item.note)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 6. 早晚护肤流程 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#127770; 早晚护肤流程</span></div>
          <div style="margin-bottom:16px;">
            <h4 style="font-size:0.95rem;color:#4A4642;margin-bottom:8px;">&#9728; 晨间流程</h4>
            <ol style="padding-left:20px;font-size:0.88rem;color:#5A5650;line-height:1.8;">
              ${data.morningRoutine.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
            </ol>
            <div class="tip-box" style="margin-top:8px;background:rgba(212,181,130,0.12);border-left:3px solid #D4B582;padding:10px 14px;border-radius:8px;font-size:0.82rem;color:#5A5650;">
              <strong>提示：</strong>${escapeHtml(data.morningNote)}
            </div>
          </div>
          <div>
            <h4 style="font-size:0.95rem;color:#4A4642;margin-bottom:8px;">&#9790; 晚间流程</h4>
            <ol style="padding-left:20px;font-size:0.88rem;color:#5A5650;line-height:1.8;">
              ${data.eveningRoutine.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
            </ol>
            <div class="tip-box" style="margin-top:8px;background:rgba(157,174,148,0.1);border-left:3px solid #9DAE94;padding:10px 14px;border-radius:8px;font-size:0.82rem;color:#5A5650;">
              <strong>注意：</strong>${escapeHtml(data.eveningNote)}
            </div>
          </div>
        </div>

        <!-- 7. 红肿硬痘急救流程 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#9888; 红肿硬痘急救流程</span></div>
          <ol style="padding-left:20px;font-size:0.88rem;color:#5A5650;line-height:1.8;">
            ${data.emergencyRoutine.map(step => `<li>${escapeHtml(step)}</li>`).join('')}
          </ol>
        </div>

        <!-- 8. 用酸铁律 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#9888; 用酸铁律</span></div>
          <ul style="padding-left:20px;font-size:0.88rem;color:#5A5650;line-height:1.8;">
            ${data.acidRules.map(rule => `<li>${escapeHtml(rule)}</li>`).join('')}
          </ul>
        </div>

        <!-- 9. 生活方式改造清单 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#127793; 生活方式改造清单</span></div>
          <ul style="padding-left:20px;font-size:0.88rem;color:#5A5650;line-height:1.8;">
            ${data.lifestyle.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>

        <!-- 10. 就医红线 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128657; 就医红线</span></div>
          <p style="font-size:0.85rem;color:#5A5650;margin-bottom:8px;">出现以下任何一条，请及时就医：</p>
          <ul style="padding-left:20px;font-size:0.88rem;color:#5A5650;line-height:1.8;">
            ${data.medicalRedLines.map(line => `<li>${escapeHtml(line)}</li>`).join('')}
          </ul>
          <div class="tip-box" style="margin-top:12px;background:rgba(201,155,155,0.08);border-left:3px solid #C99B9B;padding:10px 14px;border-radius:8px;font-size:0.82rem;color:#5A5650;">
            <strong>就医建议：</strong>${escapeHtml(data.medicalTip)}
          </div>
        </div>

        <!-- 11. 避坑指南 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128683; 避坑指南</span></div>
          <ul style="padding-left:20px;font-size:0.88rem;color:#5A5650;line-height:1.8;">
            ${data.pitfalls.map(p => `<li>${escapeHtml(p)}</li>`).join('')}
          </ul>
        </div>

        <!-- 12. 预期改善时间线 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128197; 预期改善时间线</span></div>
          ${data.timeline.map(t => `
            <div style="background:#fff;border:1px solid #EBE7E2;border-radius:10px;padding:14px;margin-bottom:10px;box-shadow:0 1px 3px rgba(74,70,66,0.04);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <span class="tag tag-study">${escapeHtml(t.time)}</span>
              </div>
              <p style="font-size:0.88rem;color:#5A5650;margin-bottom:4px;">${escapeHtml(t.change)}</p>
              <div style="font-size:0.82rem;color:#918B83;background:rgba(157,174,148,0.08);padding:8px 10px;border-radius:6px;">
                <strong>心态提醒：</strong>${escapeHtml(t.mindset)}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 结语 -->
        <div class="card" style="background:rgba(157,174,148,0.06);">
          <div class="card-header"><span class="card-title">&#10024; 结语</span></div>
          <p style="font-size:0.88rem;color:#5A5650;line-height:1.8;">${escapeHtml(data.closingNote)}</p>
        </div>
      </div>
    `;
  };

  // =============================================================
  // 2. 五年计划详情页
  // =============================================================
  window.renderFiveYearPlanDetail = function renderFiveYearPlanDetail() {
    const content = document.getElementById('app-content');
    const data = ContentData.fiveYearPlan;

    // 生成阶段卡片HTML
    function renderPhase(phase) {
      let html = `
        <div class="phase-card" style="background:#fff;border:1px solid #EBE7E2;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(74,70,66,0.05);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-weight:600;color:#4A4642;font-size:1rem;">${escapeHtml(phase.name)}</span>
            <span class="tag tag-study">${escapeHtml(phase.period)}</span>
          </div>
          <p style="font-size:0.88rem;color:#5A5650;margin-bottom:10px;">${escapeHtml(phase.description)}</p>`;

      // 如果有子阶段
      if (phase.subPhases) {
        phase.subPhases.forEach(sp => {
          html += `
            <div style="background:rgba(157,174,148,0.06);border-radius:8px;padding:10px 12px;margin-bottom:8px;">
              <div style="font-weight:500;font-size:0.9rem;color:#4A4642;margin-bottom:6px;">${escapeHtml(sp.name)}</div>
              <ul style="padding-left:18px;font-size:0.85rem;color:#5A5650;line-height:1.7;margin:0;">
                ${sp.tasks.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
              </ul>
            </div>`;
        });
      }

      // 如果有任务列表
      if (phase.tasks) {
        phase.tasks.forEach(t => {
          const priorityTag = t.priority === '最高' ? 'tag-study' : t.priority === '高' ? 'tag-progress' : 'tag-clickable';
          html += `
            <div style="background:rgba(157,174,148,0.06);border-radius:8px;padding:10px 12px;margin-bottom:6px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                <span style="font-weight:500;font-size:0.9rem;color:#4A4642;">${escapeHtml(t.name)}</span>
                <span class="tag ${priorityTag}">${escapeHtml(t.priority)}</span>
              </div>
              <div style="font-size:0.82rem;color:#918B83;margin-bottom:4px;">${escapeHtml(t.date)}</div>
              <div style="font-size:0.85rem;color:#5A5650;">${escapeHtml(t.details)}</div>
            </div>`;
        });
      }

      // 如果有路径A
      if (phase.pathA) {
        html += `
          <div style="margin-top:10px;">
            <div style="background:rgba(157,174,148,0.1);border-radius:8px;padding:10px 12px;margin-bottom:8px;border-left:3px solid #9DAE94;">
              <div style="font-weight:500;font-size:0.9rem;color:#4A4642;margin-bottom:6px;">${escapeHtml(phase.pathA.name)}</div>
              <ul style="padding-left:18px;font-size:0.85rem;color:#5A5650;line-height:1.7;margin:0;">
                ${phase.pathA.tasks.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
              </ul>
            </div>`;
        if (phase.pathB) {
          html += `
            <div style="background:rgba(212,181,130,0.1);border-radius:8px;padding:10px 12px;margin-bottom:8px;border-left:3px solid #D4B582;">
              <div style="font-weight:500;font-size:0.9rem;color:#4A4642;margin-bottom:6px;">${escapeHtml(phase.pathB.name)}</div>
              <ul style="padding-left:18px;font-size:0.85rem;color:#5A5650;line-height:1.7;margin:0;">
                ${phase.pathB.tasks.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
              </ul>
            </div>`;
        }
        html += '</div>';
      }

      // 如果有公共任务
      if (phase.commonTasks) {
        phase.commonTasks.forEach(t => {
          html += `
            <div class="tip-box" style="margin-top:10px;background:rgba(157,174,148,0.08);border-left:3px solid #9DAE94;padding:10px 14px;border-radius:8px;font-size:0.85rem;color:#5A5650;">
              ${escapeHtml(t)}
            </div>`;
        });
      }

      html += '</div>';
      return html;
    }

    content.innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('strategy')">&#8592; 返回</button>
          <h2>${escapeHtml(data.title)}</h2>
          <span></span>
        </div>
        <p class="page-subtitle">${escapeHtml(data.subtitle)}</p>
        <p style="font-size:0.85rem;color:#918B83;text-align:center;margin-bottom:16px;">${escapeHtml(data.period)}</p>

        <!-- 1. 个人画像与战略定位 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128100; 个人画像与战略定位</span></div>
          <table class="info-table">
            <tr><td>身份</td><td>${escapeHtml(data.profile.identity)}</td></tr>
            <tr><td>专业</td><td>${escapeHtml(data.profile.major)}</td></tr>
            <tr><td>导师</td><td>${escapeHtml(data.profile.mentor)}<span style="font-size:0.8rem;color:#918B83;margin-left:6px;">（${escapeHtml(data.profile.mentorNote)}）</span></td></tr>
            <tr><td>政治面貌</td><td>${escapeHtml(data.profile.politicalStatus)}<span style="font-size:0.8rem;color:#918B83;margin-left:6px;">（${escapeHtml(data.profile.politicalNote)}）</span></td></tr>
            <tr><td>经历</td><td>${escapeHtml(data.profile.experience)}</td></tr>
            <tr><td>实习</td><td>${escapeHtml(data.profile.internship)}</td></tr>
            <tr><td>财务</td><td>${escapeHtml(data.profile.finance)}</td></tr>
            <tr><td>月预算</td><td>${escapeHtml(data.profile.monthlyBudget)}</td></tr>
            <tr><td>驱动力</td><td>${escapeHtml(data.profile.drive)}<span style="font-size:0.8rem;color:#918B83;margin-left:6px;">（${escapeHtml(data.profile.driveNote)}）</span></td></tr>
          </table>
          <div class="tip-box" style="margin-top:12px;background:rgba(157,174,148,0.1);border-left:3px solid #9DAE94;padding:14px 16px;border-radius:8px;font-size:0.85rem;color:#5A5650;">
            <strong>战略定位：</strong>${escapeHtml(data.profile.strategicPositioning)}
          </div>
          <div class="danger-box" style="margin-top:8px;background:rgba(201,155,155,0.08);border-left:3px solid #C99B9B;padding:10px 14px;border-radius:8px;font-size:0.85rem;color:#5A5650;">
            <strong>核心约束：</strong>${escapeHtml(data.profile.coreConstraint)}
          </div>
        </div>

        <!-- 2. 7个阶段时间线 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128197; 7个阶段时间线</span></div>
          ${data.phases.map(p => renderPhase(p)).join('')}
        </div>

        <!-- 3. 关键里程碑列表 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#127937; 关键里程碑</span></div>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:400px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">日期</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">事件</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">类型</th>
                </tr>
              </thead>
              <tbody>
                ${data.milestones.map(m => {
                  const typeTag = m.type === '最关键节点' ? 'tag-study' : m.type === '硬节点' ? 'tag-progress' : m.type === '硬截止' ? 'tag-skin-condition' : 'tag-clickable';
                  return `
                    <tr>
                      <td style="padding:6px 10px;font-size:0.85rem;white-space:nowrap;">${escapeHtml(m.date)}</td>
                      <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(m.event)}</td>
                      <td style="padding:6px 10px;font-size:0.85rem;"><span class="tag ${typeTag}">${escapeHtml(m.type)}</span></td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 4. 财务管理专题 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128176; 财务管理专题</span></div>

          <h4 style="font-size:0.9rem;color:#4A4642;margin:12px 0 8px;">当前负债</h4>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:400px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">项目</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">金额</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">类型</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">还款时间</th>
                </tr>
              </thead>
              <tbody>
                ${data.finance.currentLiabilities.map(l => `
                  <tr>
                    <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(l.item)}</td>
                    <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(l.amount)}</td>
                    <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(l.type)}</td>
                    <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(l.repaymentTime)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <h4 style="font-size:0.9rem;color:#4A4642;margin:16px 0 8px;">研究生阶段收入来源</h4>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:400px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">来源</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">金额</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">备注</th>
                </tr>
              </thead>
              <tbody>
                ${data.finance.graduateIncome.map(i => `
                  <tr>
                    <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(i.source)}</td>
                    <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(i.amount)}</td>
                    <td style="padding:6px 10px;font-size:0.85rem;color:#918B83;">${escapeHtml(i.note)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="tip-box" style="margin-top:12px;background:rgba(157,174,148,0.1);border-left:3px solid #9DAE94;padding:10px 14px;border-radius:8px;font-size:0.85rem;color:#5A5650;">
            <strong>财务纪律：</strong>${escapeHtml(data.finance.discipline)}
          </div>

          <h4 style="font-size:0.9rem;color:#4A4642;margin:16px 0 8px;">选调上岸后收入预期</h4>
          <table class="info-table">
            <tr><td>月收入</td><td>${escapeHtml(data.finance.postSelectionIncome.monthly)}</td></tr>
            <tr><td>年收入</td><td>${escapeHtml(data.finance.postSelectionIncome.annual)}</td></tr>
            <tr><td>年结余</td><td>${escapeHtml(data.finance.postSelectionIncome.annualSavings)}</td></tr>
            <tr><td>用途</td><td>${escapeHtml(data.finance.postSelectionIncome.usage)}</td></tr>
          </table>
        </div>

        <!-- 5. 风险预案表格 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#9888; 风险预案</span></div>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:500px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">风险</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">等级</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">影响</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">应对措施</th>
                </tr>
              </thead>
              <tbody>
                ${data.risks.map(r => {
                  const levelTag = r.level === '高' ? 'tag-skin-condition' : r.level === '中' ? 'tag-progress' : 'tag-clickable';
                  return `
                    <tr>
                      <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(r.risk)}</td>
                      <td style="padding:6px 10px;font-size:0.85rem;"><span class="tag ${levelTag}">${escapeHtml(r.level)}</span></td>
                      <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(r.impact)}</td>
                      <td style="padding:6px 10px;font-size:0.85rem;color:#5A5650;">${escapeHtml(r.countermeasure)}</td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  };

  // =============================================================
  // 3. 科研计划详情页
  // =============================================================
  window.renderResearchPlan = function renderResearchPlan() {
    const content = document.getElementById('app-content');
    const data = ContentData.researchPlan;

    content.innerHTML = `
      <div class="page">
        <div class="page-header">
          <button class="btn btn-outline btn-sm" onclick="Router.navigate('study')">&#8592; 返回</button>
          <h2>${escapeHtml(data.title)}</h2>
          <span></span>
        </div>
        <p class="page-subtitle">${escapeHtml(data.subtitle)}</p>
        <p style="font-size:0.85rem;color:#918B83;text-align:center;margin-bottom:16px;">${escapeHtml(data.period)}</p>

        <!-- 背景说明 -->
        <div class="card" style="background:rgba(157,174,148,0.06);">
          <div class="card-header"><span class="card-title">&#128214; 项目背景</span></div>
          <p style="font-size:0.88rem;color:#5A5650;line-height:1.8;">${escapeHtml(data.background)}</p>
        </div>

        <!-- 目标说明 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#127919; 学习目标</span></div>
          <p style="font-size:0.88rem;color:#5A5650;line-height:1.8;">${escapeHtml(data.goalDescription)}</p>
        </div>

        <!-- 1. 4大学习模块概览 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128218; 4大学习模块概览</span></div>
          <div class="module-cards">
            ${data.modules.map(m => `
              <div class="phase-card" style="background:#fff;border:1px solid #EBE7E2;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(74,70,66,0.05);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                  <span style="font-weight:600;color:#4A4642;font-size:1rem;">${escapeHtml(m.name)}</span>
                  <span class="tag tag-study">${escapeHtml(m.duration)}</span>
                </div>
                <div style="font-size:0.82rem;color:#918B83;margin-bottom:6px;">${escapeHtml(m.period)}</div>
                <p style="font-size:0.88rem;color:#5A5650;margin-bottom:8px;">${escapeHtml(m.description)}</p>
                <ul style="padding-left:18px;font-size:0.85rem;color:#5A5650;line-height:1.7;margin:0;">
                  ${m.topics.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 2. 7周完整日程（可折叠） -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128197; 7周完整日程</span></div>
          ${data.weeklySchedule.map(w => `
            <div class="week-collapse" style="border:1px solid #EBE7E2;border-radius:10px;margin-bottom:10px;overflow:hidden;">
              <div class="week-header" style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:rgba(157,174,148,0.06);cursor:pointer;user-select:none;" onclick="this.parentElement.classList.toggle('collapsed');this.querySelector('.collapse-icon').textContent = this.parentElement.classList.contains('collapsed') ? '&#9654;' : '&#9660;';">
                <div>
                  <span style="font-weight:600;color:#4A4642;font-size:0.95rem;">${escapeHtml(w.title)}</span>
                  <span style="font-size:0.82rem;color:#918B83;margin-left:8px;">${escapeHtml(w.date)}</span>
                </div>
                <span class="collapse-icon" style="font-size:0.8rem;color:#7A8B73;">&#9660;</span>
              </div>
              <div class="week-body" style="padding:12px 14px;">
                ${w.days.map(d => `
                  <div style="background:#FAF9F7;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                      <span style="font-weight:500;font-size:0.85rem;color:#4A4642;">${escapeHtml(d.date)}</span>
                      <span class="tag tag-clickable" style="font-size:0.75rem;">${escapeHtml(d.topic)}</span>
                    </div>
                    <p style="font-size:0.82rem;color:#5A5650;line-height:1.6;margin-bottom:4px;">${escapeHtml(d.content)}</p>
                    <div style="font-size:0.8rem;color:#7A8B73;background:rgba(157,174,148,0.08);padding:6px 10px;border-radius:6px;">
                      <strong>任务：</strong>${escapeHtml(d.task)}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 3. 每日时间安排 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128339; 每日时间安排</span></div>

          <h4 style="font-size:0.9rem;color:#4A4642;margin:0 0 10px;">实习期间（工作日）</h4>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:300px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">时间</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">活动</th>
                </tr>
              </thead>
              <tbody>
                ${data.dailySchedule.internshipPeriod.weekdays.map(s => `
                  <tr>
                    <td style="padding:5px 10px;font-size:0.82rem;white-space:nowrap;">${escapeHtml(s.time)}</td>
                    <td style="padding:5px 10px;font-size:0.82rem;color:#5A5650;">${escapeHtml(s.activity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div style="font-size:0.82rem;color:#918B83;margin:8px 0 16px;text-align:right;">${escapeHtml(data.dailySchedule.internshipPeriod.totalDaily)}</div>

          <h4 style="font-size:0.9rem;color:#4A4642;margin:0 0 10px;">实习期间（周末）</h4>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:300px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">时间</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">活动</th>
                </tr>
              </thead>
              <tbody>
                ${data.dailySchedule.internshipPeriod.weekends.map(s => `
                  <tr>
                    <td style="padding:5px 10px;font-size:0.82rem;white-space:nowrap;">${escapeHtml(s.time)}</td>
                    <td style="padding:5px 10px;font-size:0.82rem;color:#5A5650;">${escapeHtml(s.activity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div style="font-size:0.82rem;color:#918B83;margin:8px 0 16px;text-align:right;">${escapeHtml(data.dailySchedule.internshipPeriod.totalDaily)}</div>

          <h4 style="font-size:0.9rem;color:#4A4642;margin:0 0 10px;">实习结束后（工作日）</h4>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:300px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">时间</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">活动</th>
                </tr>
              </thead>
              <tbody>
                ${data.dailySchedule.postInternship.weekdays.map(s => `
                  <tr>
                    <td style="padding:5px 10px;font-size:0.82rem;white-space:nowrap;">${escapeHtml(s.time)}</td>
                    <td style="padding:5px 10px;font-size:0.82rem;color:#5A5650;">${escapeHtml(s.activity)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div style="font-size:0.82rem;color:#918B83;margin:8px 0 0;text-align:right;">${escapeHtml(data.dailySchedule.postInternship.totalDaily)}</div>
        </div>

        <!-- 4. 学习资源汇总 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128218; 学习资源汇总</span></div>

          <h4 style="font-size:0.9rem;color:#4A4642;margin:0 0 8px;">数据库</h4>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:350px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">名称</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">描述</th>
                </tr>
              </thead>
              <tbody>
                ${data.resources.databases.map(db => `
                  <tr>
                    <td style="padding:5px 10px;font-size:0.82rem;"><a href="https://${escapeHtml(db.url)}" target="_blank" style="color:#7A8B73;text-decoration:none;">${escapeHtml(db.name)}</a></td>
                    <td style="padding:5px 10px;font-size:0.82rem;color:#5A5650;">${escapeHtml(db.description)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <h4 style="font-size:0.9rem;color:#4A4642;margin:16px 0 8px;">工具</h4>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:350px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">名称</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">描述</th>
                </tr>
              </thead>
              <tbody>
                ${data.resources.tools.map(t => `
                  <tr>
                    <td style="padding:5px 10px;font-size:0.82rem;"><a href="https://${escapeHtml(t.url)}" target="_blank" style="color:#7A8B73;text-decoration:none;">${escapeHtml(t.name)}</a></td>
                    <td style="padding:5px 10px;font-size:0.82rem;color:#5A5650;">${escapeHtml(t.description)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <h4 style="font-size:0.9rem;color:#4A4642;margin:16px 0 8px;">课程</h4>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:350px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">名称</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">平台</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">描述</th>
                </tr>
              </thead>
              <tbody>
                ${data.resources.courses.map(c => `
                  <tr>
                    <td style="padding:5px 10px;font-size:0.82rem;">${escapeHtml(c.name)}</td>
                    <td style="padding:5px 10px;font-size:0.82rem;">${escapeHtml(c.platform)}</td>
                    <td style="padding:5px 10px;font-size:0.82rem;color:#5A5650;">${escapeHtml(c.description)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <h4 style="font-size:0.9rem;color:#4A4642;margin:16px 0 8px;">推荐书籍</h4>
          <ul style="padding-left:20px;font-size:0.85rem;color:#5A5650;line-height:1.8;">
            ${data.resources.books.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
          </ul>

          <h4 style="font-size:0.9rem;color:#4A4642;margin:16px 0 8px;">网站</h4>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:350px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">名称</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">描述</th>
                </tr>
              </thead>
              <tbody>
                ${data.resources.websites.map(s => `
                  <tr>
                    <td style="padding:5px 10px;font-size:0.82rem;"><a href="https://${escapeHtml(s.url)}" target="_blank" style="color:#7A8B73;text-decoration:none;">${escapeHtml(s.name)}</a></td>
                    <td style="padding:5px 10px;font-size:0.82rem;color:#5A5650;">${escapeHtml(s.description)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 硬性截止日期 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#9200; 硬性截止日期</span></div>
          <div class="table-wrap" style="overflow-x:auto;">
            <table class="info-table" style="width:100%;min-width:400px;">
              <thead>
                <tr style="background:rgba(157,174,148,0.1);">
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">日期</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">事件</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">类型</th>
                  <th style="padding:8px 10px;text-align:left;font-size:0.85rem;">备注</th>
                </tr>
              </thead>
              <tbody>
                ${data.hardDeadlines.map(d => `
                  <tr>
                    <td style="padding:6px 10px;font-size:0.85rem;white-space:nowrap;">${escapeHtml(d.date)}</td>
                    <td style="padding:6px 10px;font-size:0.85rem;">${escapeHtml(d.event)}</td>
                    <td style="padding:6px 10px;font-size:0.85rem;"><span class="tag ${d.type === '硬性' ? 'tag-skin-condition' : 'tag-clickable'}">${escapeHtml(d.type)}</span></td>
                    <td style="padding:6px 10px;font-size:0.85rem;color:#5A5650;">${escapeHtml(d.note)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 周复盘模板 -->
        <div class="card">
          <div class="card-header"><span class="card-title">&#128221; 周复盘模板</span></div>
          <ol style="padding-left:20px;font-size:0.85rem;color:#5A5650;line-height:1.8;">
            ${data.weekReviewTemplate.map(q => `<li>${escapeHtml(q)}</li>`).join('')}
          </ol>
        </div>

        <!-- 后续计划 -->
        <div class="card" style="background:rgba(157,174,148,0.06);">
          <div class="card-header"><span class="card-title">&#128200; 后续计划</span></div>
          <h4 style="font-size:0.9rem;color:#4A4642;margin:0 0 8px;">${escapeHtml(data.postPlan.title)}</h4>
          <p style="font-size:0.85rem;color:#5A5650;margin-bottom:12px;">${escapeHtml(data.postPlan.description)}</p>
          <div style="font-size:0.85rem;color:#5A5650;line-height:1.7;">
            ${data.postPlan.readingOrder.map(rd => `
              <div style="background:#fff;border:1px solid #EBE7E2;border-radius:8px;padding:10px 12px;margin-bottom:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                  <span style="font-weight:500;font-size:0.85rem;color:#4A4642;">${escapeHtml(rd.title)}</span>
                  <span class="tag tag-clickable" style="font-size:0.75rem;">${escapeHtml(rd.date)}</span>
                </div>
                <div style="font-size:0.8rem;color:#918B83;margin-bottom:2px;">${escapeHtml(rd.type)}</div>
                <p style="font-size:0.82rem;color:#5A5650;margin:0;">${escapeHtml(rd.description)}</p>
              </div>
            `).join('')}
          </div>
          <div class="tip-box" style="margin-top:12px;background:rgba(157,174,148,0.1);border-left:3px solid #9DAE94;padding:10px 14px;border-radius:8px;font-size:0.85rem;color:#5A5650;">
            <strong>后续时间线：</strong>${escapeHtml(data.postPlan.postReadingTimeline)}
          </div>
        </div>
      </div>
    `;
  };
})();