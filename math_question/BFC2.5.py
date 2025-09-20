import matplotlib.pyplot as plt
import numpy as np
import math

def draw_triangle():
    # 角度设置
    angle_A = 60.0
    angle_B = 40.8
    angle_C = 79.2
    
    print(f"绘制锐角三角形ABC")
    print(f"角A = {angle_A}°")
    print(f"角B = {angle_B}°") 
    print(f"角C = {angle_C}°")
    print(f"角度和 = {angle_A + angle_B + angle_C}°")
    
    # 转换为弧度
    A_rad = math.radians(angle_A)
    B_rad = math.radians(angle_B)
    C_rad = math.radians(angle_C)
    
    # 设置边长，使用正弦定理
    a = 10.0  # BC边
    b = a * math.sin(B_rad) / math.sin(A_rad)  # AC边
    c = a * math.sin(C_rad) / math.sin(A_rad)  # AB边
    
    print(f"\n边长:")
    print(f"BC (a) = {a:.3f}")
    print(f"AC (b) = {b:.3f}")
    print(f"AB (c) = {c:.3f}")
    
    # 顶点坐标 - 水平翻转：B在左边，C在右边
    B = np.array([0.0, 0.0])  # B点在原点（左边）
    C = np.array([a, 0.0])    # C点在右边
    # A点位置：从B点出发，按角B的方向计算
    A_x = c * math.cos(B_rad)  # 使用AB边长c和角B
    A_y = c * math.sin(B_rad)
    A = np.array([A_x, A_y])
    
    print(f"\n顶点坐标:")
    print(f"A = ({A[0]:.3f}, {A[1]:.3f})")
    print(f"B = ({B[0]:.3f}, {B[1]:.3f})")
    print(f"C = ({C[0]:.3f}, {C[1]:.3f})")
    
    # 绘图
    fig, ax = plt.subplots(figsize=(10, 8))
    
    # 三角形顶点
    triangle_x = [A[0], B[0], C[0], A[0]]
    triangle_y = [A[1], B[1], C[1], A[1]]
    
    # 绘制三角形 - 改为黑色
    ax.plot(triangle_x, triangle_y, 'k-', linewidth=2)
    
    # 计算角平分线的交点
    # 角B的角平分线交AC边于E点
    # 使用角平分线定理：AE/EC = AB/BC = c/a
    ratio_BE = c / a  # AB/BC
    # E点将AC按比例c:a分割，E更靠近A
    t_E = ratio_BE / (1 + ratio_BE)  # AE/AC的比例
    E = A + t_E * (C - A)
    
    # 角C的角平分线交AB边于D点  
    # 使用角平分线定理：AD/DB = AC/BC = b/a
    ratio_CD = b / a  # AC/BC  
    # D点将AB按比例b:a分割，D更靠近A
    t_D = ratio_CD / (1 + ratio_CD)  # AD/AB的比例
    D = A + t_D * (B - A)
    
    print(f"\n角平分线交点:")
    print(f"E (角B的角平分线与AC的交点) = ({E[0]:.3f}, {E[1]:.3f})")
    print(f"D (角C的角平分线与AB的交点) = ({D[0]:.3f}, {D[1]:.3f})")
    print(f"AE:EC = {c:.3f}:{a:.3f} = {c/a:.3f}:1")
    print(f"AD:DB = {b:.3f}:{a:.3f} = {b/a:.3f}:1")
    
    # 绘制角平分线 - 改为绿色
    ax.plot([B[0], E[0]], [B[1], E[1]], 'g-', linewidth=1.5)
    ax.plot([C[0], D[0]], [C[1], D[1]], 'g-', linewidth=1.5)
    
    # 计算BE和CD的交点F（内心）
    # 使用直线参数方程求交点
    # 直线BE: P = B + t1*(E-B)
    # 直线CD: P = C + t2*(D-C)
    # 求解: B + t1*(E-B) = C + t2*(D-C)
    
    # 转换为矩阵方程求解
    # [E-B, -(D-C)] * [t1, t2]' = C-B
    BE_vec = [E[0] - B[0], E[1] - B[1]]
    CD_vec = [D[0] - C[0], D[1] - C[1]]
    CB_vec = [C[0] - B[0], C[1] - B[1]]
    
    # 用克拉默法则求解
    det = BE_vec[0] * (-CD_vec[1]) - BE_vec[1] * (-CD_vec[0])
    t1 = (CB_vec[0] * (-CD_vec[1]) - CB_vec[1] * (-CD_vec[0])) / det
    
    # 计算交点F
    F = [B[0] + t1 * BE_vec[0], B[1] + t1 * BE_vec[1]]
    
    print(f"内心F (BE与CD交点) = ({F[0]:.3f}, {F[1]:.3f})")
    
    # 计算角BFC的角平分线FG与BC边的交点G
    # 首先计算角BFC的角平分线方向
    # 向量FB和FC
    FB_vec = [B[0] - F[0], B[1] - F[1]]
    FC_vec = [C[0] - F[0], C[1] - F[1]]
    
    # 计算FB和FC的单位向量
    FB_len = math.sqrt(FB_vec[0]**2 + FB_vec[1]**2)
    FC_len = math.sqrt(FC_vec[0]**2 + FC_vec[1]**2)
    FB_unit = [FB_vec[0]/FB_len, FB_vec[1]/FB_len]
    FC_unit = [FC_vec[0]/FC_len, FC_vec[1]/FC_len]
    
    # 角平分线方向向量（FB和FC单位向量的和）
    bisector_dir = [FB_unit[0] + FC_unit[0], FB_unit[1] + FC_unit[1]]
    
    # 计算角BFC的角平分线FG与BC边的交点G
    # 直线FG: F + t * bisector_dir
    # 直线BC: y = 0 (从B(0,0)到C(10,0))
    # 求解交点：F_y + t * bisector_dir_y = 0
    t_G = -F[1] / bisector_dir[1] if bisector_dir[1] != 0 else 0
    
    # 计算G点坐标
    G = [F[0] + t_G * bisector_dir[0], 0]  # y坐标固定为0（在BC边上）
    
    # 确保G点在BC线段内（x坐标在0到10之间）
    if G[0] < 0:
        G[0] = 0
    elif G[0] > 10:
        G[0] = 10
    
    print(f"角BFC的角平分线与BC交点G = ({G[0]:.3f}, {G[1]:.3f})")
    
    # 绘制角BFC的角平分线FG - 绿色虚线
    ax.plot([F[0], G[0]], [F[1], G[1]], 'g--', linewidth=1.5)
    
    # 移除所有圆点标记
    
    # 标注顶点 - 改为黑色，字号放大2倍，Roman体斜体
    ax.text(A[0], A[1] + 0.3, 'A', fontsize=28, ha='center', va='bottom', color='black', weight='bold', fontfamily='serif', style='italic')
    ax.text(B[0] - 0.3, B[1], 'B', fontsize=28, ha='right', va='center', color='black', weight='bold', fontfamily='serif', style='italic')
    ax.text(C[0] + 0.3, C[1], 'C', fontsize=28, ha='left', va='center', color='black', weight='bold', fontfamily='serif', style='italic')
    
    # 标注角平分线交点 - 改为黑色，字号放大2倍，F上移，Roman体斜体
    ax.text(E[0] + 0.2, E[1] + 0.3, 'E', fontsize=24, ha='left', va='bottom', color='black', weight='bold', fontfamily='serif', style='italic')
    ax.text(D[0] - 0.2, D[1] + 0.3, 'D', fontsize=24, ha='right', va='bottom', color='black', weight='bold', fontfamily='serif', style='italic')
    ax.text(F[0], F[1] + 0.4, 'F', fontsize=24, ha='center', va='bottom', color='black', weight='bold', fontfamily='serif', style='italic')
    ax.text(G[0], G[1] - 0.4, 'G', fontsize=24, ha='center', va='top', color='black', weight='bold', fontfamily='serif', style='italic')
    
    # 绘制角A的小圆弧
    # 计算角A两边的方向角
    angle_AB = math.atan2(B[1] - A[1], B[0] - A[0])  # 从A到B的角度
    angle_AC = math.atan2(C[1] - A[1], C[0] - A[0])  # 从A到C的角度
    
    # 确保角度顺序正确（从AB到AC）
    if angle_AC < angle_AB:
        angle_AC += 2 * math.pi
    
    # 绘制角A的圆弧 - 改为黑色
    arc_radius = 1.2
    arc_angles = np.linspace(angle_AB, angle_AC, 50)
    arc_x = A[0] + arc_radius * np.cos(arc_angles)
    arc_y = A[1] + arc_radius * np.sin(arc_angles)
    ax.plot(arc_x, arc_y, 'k-', linewidth=2)
    
    # 在圆弧中间标注角度 - 改为黑色，字号放大2倍
    mid_angle = (angle_AB + angle_AC) / 2
    label_radius = arc_radius + 0.4
    label_x = A[0] + label_radius * math.cos(mid_angle)
    label_y = A[1] + label_radius * math.sin(mid_angle)
    ax.text(label_x, label_y, f'{angle_A}°', fontsize=24, ha='center', va='center', color='black', weight='bold')
    
    # 设置图形 - 移除坐标和网格
    ax.set_xlim(-2, 12)
    ax.set_ylim(-2, 8)
    ax.set_aspect('equal')
    
    # 移除坐标轴、网格和标签
    ax.axis('off')  # 关闭坐标轴
    
    # ax.set_title('Triangle ABC', fontsize=16, weight='bold')
    
    plt.tight_layout()
    plt.show()
    
    # 计算面积
    area = 0.5 * a * b * math.sin(C_rad)
    print(f"\n三角形面积 = {area:.3f} 平方单位")

if __name__ == "__main__":
    draw_triangle()